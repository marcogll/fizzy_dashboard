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
  const res = await fetch(`${baseUrl}${path}`, {
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
  return res.json();
}

function normalizeFizzyCard(raw) {
  // Map Fizzy state to dashboard status
  let status = 'inprogress';
  if (raw.closed) status = 'done';
  else if (raw.postponed) status = 'not_now';
  else if (raw.golden) status = 'almost';

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
  // Fetch all cards for the account
  const data = await fetchFizzi(`/${FIZZY_ACCOUNT}/cards.json`);
  const cards = Array.isArray(data) ? data : [];
  return cards.map(normalizeFizzyCard);
}

async function fetchBoards() {
  const data = await fetchFizzi(`/${FIZZY_ACCOUNT}/boards.json`);
  return Array.isArray(data) ? data : [];
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
