require('dotenv').config();

const express = require('express');
const cors = require('cors');
const stats = require('./src/stats');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const FIZZY_API_URL = process.env.FIZZY_API_URL.replace(/\/$/, '');
const FIZZY_TOKEN = process.env.FIZZY_TOKEN;
const FIZZY_BOARD = process.env.FIZZY_BOARD;
const FIZZY_ACCOUNT = process.env.FIZZY_ACCOUNT;

async function fetchFizzi(path) {
  const baseUrl = FIZZY_API_URL.replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${FIZZY_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return { data, res };
}

const TAG_STATUS_MAP = {
  'quote': 'quote',
  'tracking': 'tracking',
  'tbd': 'tbd',
  'review': 'review',
  'blocked': 'stopped',
  'waiting': 'not_now',
  'approved': 'done',
  'stopped': 'stopped',
  'maybe': 'maybe',
  'backlog': 'backlog',
  'testing': 'testing',
  'dev': 'dev',
  'development': 'dev',
  'urgent': 'almost',
  'golden': 'almost',
  'qa': 'testing',
};

function inferStatus(raw) {
  // Priority 1: explicit Fizzy states
  if (raw.closed) return 'done';
  if (raw.postponed) return 'not_now';

  // Priority 2: tags
  for (const tag of raw.tags || []) {
    const mapped = TAG_STATUS_MAP[String(tag).toLowerCase()];
    if (mapped) return mapped;
  }

  // Priority 3: golden flag
  if (raw.golden) return 'almost';

  return 'inprogress';
}

function normalizeFizzyCard(raw) {
  const status = inferStatus(raw);

  const assignee = raw.assignees && raw.assignees.length > 0
    ? raw.assignees[0]
    : null;

  return {
    id: raw.id || String(raw.number),
    title: raw.title || 'Untitled',
    description: raw.description || '',
    status,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    priority: raw.golden ? 'high' : '',
    assignee: assignee ? {
      id: assignee.id,
      name: assignee.name || 'Unknown',
      avatar: assignee.avatar_url || null,
    } : null,
    due_date: null, // Fizzy doesn't have native due dates
    created_at: raw.created_at || null,
    updated_at: raw.last_active_at || raw.created_at || null,
    board: raw.board || null,
    _raw: raw,
  };
}

async function fetchCards() {
  const cards = [];
  let nextUrl = `/${FIZZY_ACCOUNT}/cards.json`;
  while (nextUrl) {
    const { data, res } = await fetchFizzi(nextUrl);
    const page = Array.isArray(data) ? data : [];
    cards.push(...page);
    const link = res.headers.get('link') || '';
    const nextMatch = link.match(/<([^>]+)>\s*;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : null;
  }
  return cards.map(normalizeFizzyCard);
}

async function fetchBoards() {
  const { data } = await fetchFizzi(`/${FIZZY_ACCOUNT}/boards.json`);
  return Array.isArray(data) ? data : [];
}

async function fetchColumns(boardId) {
  // Try to get custom columns first
  let columns = [];
  try {
    const { data } = await fetchFizzi(`/${FIZZY_ACCOUNT}/boards/${boardId}/columns.json`);
    if (Array.isArray(data) && data.length > 0) {
      columns = data.map(c => ({ id: c.id, name: c.name, color: c.color || null }));
    }
  } catch(e) {
    // ignore, use default columns
  }

  // If no custom columns, use Fizzy's default workflow columns
  if (columns.length === 0) {
    columns = [
      { id: 'stream', name: 'Stream', color: '#89b4fa' },
      { id: 'not_now', name: 'Not now', color: '#7f849c' },
      { id: 'closed', name: 'Closed', color: '#a6e3a1' },
    ];
  }

  return columns;
}

async function fetchColumnCards(boardId, columnId) {
  try {
    const { data } = await fetchFizzi(`/${FIZZY_ACCOUNT}/boards/${boardId}/columns/${columnId}.json`);
    return Array.isArray(data) ? data : [];
  } catch(e) {
    return [];
  }
}

// Filter helpers
function filterCards(cards, query) {
  let result = [...cards];

  if (query.board && query.board !== 'all') {
    result = result.filter(c => c.board && (c.board.id === query.board || c.board.name === query.board));
  }

  if (query.from) {
    const fromDate = new Date(query.from);
    result = result.filter(c => c.created_at && new Date(c.created_at) >= fromDate);
  }

  if (query.to) {
    const toDate = new Date(query.to);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter(c => c.created_at && new Date(c.created_at) <= toDate);
  }

  if (query.search) {
    const q = query.search.toLowerCase();
    result = result.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }

  return result;
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Boards
app.get('/api/boards', async (req, res, next) => {
  try {
    const boards = await fetchBoards();
    res.json(boards.map(b => ({
      id: b.id,
      name: b.name,
      created_at: b.created_at,
    })));
  } catch (err) {
    next(err);
  }
});

// Columns with cards (real Fizzy columns)
app.get('/api/columns', async (req, res, next) => {
  try {
    const boardId = req.query.board || FIZZY_BOARD;
    const columns = await fetchColumns(boardId);
    const result = [];
    for (const col of columns) {
      const rawCards = await fetchColumnCards(boardId, col.id);
      const cards = rawCards.map(normalizeFizzyCard);
      result.push({
        id: col.id,
        name: col.name,
        color: col.color,
        cards,
      });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Cards with filters
app.get('/api/cards', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    const filtered = filterCards(cards, req.query);
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

// Stats endpoints
app.get('/api/stats/summary', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ summary: stats.computeSummary(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-status', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ byStatus: stats.computeByStatus(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-tag', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ byTag: stats.computeByTag(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-priority', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ byPriority: stats.computeByPriority(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/overdue', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ overdue: stats.computeOverdue(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/velocity', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ velocity: stats.computeVelocity(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-assignee', async (req, res, next) => {
  try {
    const cards = filterCards(await fetchCards(), req.query);
    res.json({ byAssignee: stats.computeByAssignee(cards) });
  } catch (err) {
    next(err);
  }
});

// Error handler for Fizzi API failures
app.use((err, req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(502).json({
      error: 'Fizzi API unavailable',
      message: err.message,
    });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
