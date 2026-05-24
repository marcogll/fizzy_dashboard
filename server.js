require('dotenv').config();

const express = require('express');
const cors = require('cors');
const stats = require('./src/stats');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const FIZZY_API_URL = process.env.FIZZY_API_URL;
const FIZZY_TOKEN = process.env.FIZZY_TOKEN;
const FIZZY_BOARD = process.env.FIZZY_BOARD;
const FIZZY_ACCOUNT = process.env.FIZZY_ACCOUNT;

async function fetchFizzi(path) {
  const baseUrl = FIZZY_API_URL.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Authorization': `Bearer ${FIZZY_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

function normalizeCard(raw) {
  return {
    id: raw.id || raw._id || Math.random().toString(36).slice(2),
    title: raw.title || raw.name || 'Untitled',
    description: raw.description || raw.desc || raw.body || '',
    status: raw.status || raw.state || raw.column || '',
    tags: Array.isArray(raw.tags) ? raw.tags :
          Array.isArray(raw.labels) ? raw.labels :
          raw.tags ? [raw.tags] : [],
    priority: raw.priority || raw.importance || '',
    assignee: raw.assignee || raw.assigned_to || raw.member || null,
    due_date: raw.due_date || raw.dueDate || raw.due || null,
    created_at: raw.created_at || raw.createdAt || null,
    updated_at: raw.updated_at || raw.updatedAt || null,
  };
}

async function fetchCards() {
  const endpoints = [
    `/api/v1/boards/${FIZZY_BOARD}/cards`,
    `/api/v1/accounts/${FIZZY_ACCOUNT}/boards/${FIZZY_BOARD}/cards`,
    `/api/boards/${FIZZY_BOARD}/cards`,
    `/v1/boards/${FIZZY_BOARD}/cards`,
    `/api/v1/cards?board=${FIZZY_BOARD}`,
  ];

  let lastErr;
  for (const ep of endpoints) {
    try {
      const data = await fetchFizzi(ep);
      const cards = Array.isArray(data) ? data :
                    data.cards ? data.cards :
                    data.data ? data.data :
                    data.items ? data.items : [];
      return cards.map(normalizeCard);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('Could not reach Fizzi API');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/cards', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/summary', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ summary: stats.computeSummary(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-status', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ byStatus: stats.computeByStatus(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-tag', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ byTag: stats.computeByTag(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-priority', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ byPriority: stats.computeByPriority(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/overdue', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ overdue: stats.computeOverdue(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/velocity', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ velocity: stats.computeVelocity(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-assignee', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ byAssignee: stats.computeByAssignee(cards) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats/by-priority', async (req, res, next) => {
  try {
    const cards = await fetchCards();
    res.json({ byPriority: stats.computeByPriority(cards) });
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
