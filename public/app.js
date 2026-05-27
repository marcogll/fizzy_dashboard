// ─── Catppuccin Mocha status palette ─────────────────
const STATUSES_MOCHA = [
  { key: 'not_now',    label: 'Not now',     color: '#7f849c', bg: '#2a2b3d', border: 'rgba(127,132,156,0.19)' },
  { key: 'maybe',     label: 'Maybe?',      color: '#f9e2af', bg: '#2c2c1a', border: 'rgba(249,226,175,0.19)' },
  { key: 'tbd',       label: 'TBD',         color: '#6c7086', bg: '#25263a', border: 'rgba(108,112,134,0.19)' },
  { key: 'backlog',   label: 'Backlog',     color: '#585b70', bg: '#25263a', border: 'rgba(88,91,112,0.19)' },
  { key: 'inprogress',label: 'In progress', color: '#89b4fa', bg: '#1c2339', border: 'rgba(137,180,250,0.19)' },
  { key: 'ongoing',   label: 'Ongoing',     color: '#74c7ec', bg: '#1a2534', border: 'rgba(116,199,236,0.19)' },
  { key: 'dev',       label: 'Development', color: '#a6e3a1', bg: '#1e2b22', border: 'rgba(166,227,161,0.19)' },
  { key: 'testing',   label: 'Testing',     color: '#cba6f7', bg: '#271f38', border: 'rgba(203,166,247,0.19)' },
  { key: 'review',    label: 'Review',      color: '#f5c2e7', bg: '#2d1e2d', border: 'rgba(245,194,231,0.19)' },
  { key: 'quote',     label: 'Quote',       color: '#f9e2af', bg: '#2c2c1a', border: 'rgba(249,226,175,0.19)' },
  { key: 'tracking',  label: 'Tracking',    color: '#b4befe', bg: '#1e1e3a', border: 'rgba(180,190,254,0.19)' },
  { key: 'almost',    label: 'Almost',      color: '#fab387', bg: '#2c2218', border: 'rgba(250,179,135,0.19)' },
  { key: 'almost_done',label:'Almost Done', color: '#f9e2af', bg: '#2c2c1a', border: 'rgba(249,226,175,0.19)' },
  { key: 'stopped',   label: 'Stopped',     color: '#f38ba8', bg: '#2d1e26', border: 'rgba(243,139,168,0.19)' },
  { key: 'done',      label: 'Done',        color: '#a6e3a1', bg: '#1e2b22', border: 'rgba(166,227,161,0.19)' },
];

// ─── Catppuccin Latte status palette ─────────────────
const STATUSES_LATTE = [
  { key: 'not_now',    label: 'Not now',     color: '#8c8fa1', bg: '#d0d3df', border: 'rgba(140,143,161,0.25)' },
  { key: 'maybe',     label: 'Maybe?',      color: '#df8e1d', bg: '#eedec0', border: 'rgba(223,142,29,0.25)'  },
  { key: 'tbd',       label: 'TBD',         color: '#9ca0b0', bg: '#d8dce8', border: 'rgba(156,160,176,0.25)' },
  { key: 'backlog',   label: 'Backlog',     color: '#8c8fa1', bg: '#d8dce8', border: 'rgba(140,143,161,0.25)' },
  { key: 'inprogress',label: 'In progress', color: '#1e66f5', bg: '#d0ddf9', border: 'rgba(30,102,245,0.25)'  },
  { key: 'ongoing',   label: 'Ongoing',     color: '#209fb5', bg: '#cce8ee', border: 'rgba(32,159,181,0.25)'  },
  { key: 'dev',       label: 'Development', color: '#40a02b', bg: '#d0e8cc', border: 'rgba(64,160,43,0.25)'   },
  { key: 'testing',   label: 'Testing',     color: '#8839ef', bg: '#e0d0f8', border: 'rgba(136,57,239,0.25)'  },
  { key: 'review',    label: 'Review',      color: '#ea76cb', bg: '#f5d0e8', border: 'rgba(234,118,203,0.25)' },
  { key: 'quote',     label: 'Quote',       color: '#df8e1d', bg: '#eedec0', border: 'rgba(223,142,29,0.25)'  },
  { key: 'tracking',  label: 'Tracking',    color: '#7287fd', bg: '#d0d5f9', border: 'rgba(114,135,253,0.25)' },
  { key: 'almost',    label: 'Almost',      color: '#fe640b', bg: '#fde5d0', border: 'rgba(254,100,11,0.25)'  },
  { key: 'almost_done',label:'Almost Done', color: '#df8e1d', bg: '#eedec0', border: 'rgba(223,142,29,0.25)'  },
  { key: 'stopped',   label: 'Stopped',     color: '#d20f39', bg: '#f5d0d9', border: 'rgba(210,15,57,0.25)'   },
  { key: 'done',      label: 'Done',        color: '#40a02b', bg: '#d0e8cc', border: 'rgba(64,160,43,0.25)'   },
];

let STATUSES = STATUSES_MOCHA;

function buildStatusMap(statuses) {
  const map = {};
  statuses.forEach(s => {
    map[s.key] = s;
    map[s.label.toLowerCase()] = s;
    map[s.label.toLowerCase().replace(/[^a-z]/g,'')] = s;
  });
  return map;
}

let STATUS_MAP = buildStatusMap(STATUSES);

function resolveStatus(raw) {
  if (!raw) return null;
  const key = String(raw).toLowerCase().replace(/[^a-z_]/g,'');
  return STATUS_MAP[key] || STATUS_MAP[String(raw).toLowerCase()] || null;
}

// ─── Theme ────────────────────────────────────────────
function getTheme() {
  return document.documentElement.dataset.theme || 'mocha';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  STATUSES = theme === 'latte' ? STATUSES_LATTE : STATUSES_MOCHA;
  STATUS_MAP = buildStatusMap(STATUSES);
  try { localStorage.setItem('fizzi-theme', theme); } catch(e) {}
  // Re-render with new palette
  renderSidebar();
  renderCards();
}

function toggleTheme() {
  applyTheme(getTheme() === 'latte' ? 'mocha' : 'latte');
}

// ─── State ────────────────────────────────────────────
let allCards = [];
let filteredCards = [];
let currentView = 'board';
let activeStatus = 'all';
let activeTag = 'all';
let activeAssignee = 'all';
let searchQuery = '';
let activeBoard = 'all';
let dateFrom = '';
let dateTo = '';
let boardColumns = [];
let allTags = [];
let allAssignees = [];

// ─── API ───────────────────────────────────────────
function buildQuery() {
  const params = new URLSearchParams();
  if (activeBoard !== 'all') params.set('board', activeBoard);
  if (dateFrom) params.set('from', dateFrom);
  if (dateTo) params.set('to', dateTo);
  if (searchQuery) params.set('search', searchQuery);
  return params.toString();
}

async function fetchAPI() {
  const qs = buildQuery();
  const res = await fetch(`/api/cards${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.cards || data.data || data.items || []);
}

async function fetchBoards() {
  const res = await fetch('/api/boards');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchColumnsAPI() {
  const qs = buildQuery();
  const res = await fetch(`/api/columns${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function loadBoards() {
  try {
    const boards = await fetchBoards();
    const select = document.getElementById('board-select');
    select.innerHTML = '<option value="all">All boards</option>';
    boards.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      if (b.id === activeBoard) opt.selected = true;
      select.appendChild(opt);
    });
  } catch(e) { console.error('boards error', e); }
}

async function loadData() {
  showLoading(true);
  hideError();
  try {
    const [cardData, colData] = activeBoard !== 'all'
      ? await Promise.all([fetchAPI(), fetchColumnsAPI().catch(() => [])])
      : [await fetchAPI(), []];

    const cards = Array.isArray(cardData) ? cardData :
                  cardData.cards ? cardData.cards :
                  cardData.data ? cardData.data :
                  cardData.items ? cardData.items : [];

    allCards = cards.map(normalizeCard);
    boardColumns = colData;
    extractTags();
    extractAssignees();
    applyFilters();
    renderStats();
    renderSidebar();
    renderPeopleNav();
    renderTagFilter();
    updateLastUpdated();
  } catch(err) {
    showError(err.message);
    allCards = getDemoCards();
    boardColumns = [];
    extractTags();
    extractAssignees();
    applyFilters();
    renderStats();
    renderSidebar();
    renderPeopleNav();
    renderTagFilter();
  } finally {
    showLoading(false);
  }
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
    _raw: raw,
  };
}

function extractTags() {
  const tagSet = new Set();
  allCards.forEach(c => c.tags.forEach(t => {
    const label = typeof t === 'string' ? t : t.name || t.label || String(t);
    if (label) tagSet.add(label);
  }));
  allTags = [...tagSet].sort();
}

function extractAssignees() {
  const map = new Map();
  allCards.forEach(c => {
    const raw = c.assignee;
    if (!raw) return;
    let name, id, avatar;
    if (typeof raw === 'string') {
      name = raw;
      id = raw;
    } else if (raw && typeof raw === 'object') {
      name = raw.name || raw.fullName || raw.username || raw.email || 'Unknown';
      id = raw.id || raw._id || raw.email || name;
      avatar = raw.avatar || raw.avatarUrl || raw.picture || null;
    } else {
      name = String(raw);
      id = name;
    }
    if (!map.has(id)) map.set(id, { id, name, avatar });
  });
  allAssignees = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Filters ───────────────────────────────────────
function applyFilters() {
  filteredCards = allCards.filter(card => {
    if (activeStatus !== 'all') {
      const s = resolveStatus(card.status);
      const label = s ? s.label.toLowerCase() : card.status.toLowerCase();
      if (!label.includes(activeStatus.toLowerCase())) return false;
    }
    if (activeTag !== 'all') {
      const tags = card.tags.map(t => typeof t === 'string' ? t : t.name || '');
      if (!tags.some(t => t.toLowerCase() === activeTag.toLowerCase())) return false;
    }
    if (activeAssignee !== 'all') {
      const raw = card.assignee;
      if (activeAssignee === 'unassigned') {
        if (raw) return false;
      } else {
        if (!raw) return false;
        let id;
        if (typeof raw === 'string') id = raw;
        else if (raw && typeof raw === 'object') id = raw.id || raw._id || raw.email || raw.name || '';
        else id = String(raw);
        if (id !== activeAssignee) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!card.title.toLowerCase().includes(q) &&
          !card.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  renderCards();
  renderStats();
}

// ─── Render ─────────────────────────────────────────
function renderStats() {
  const total = filteredCards.length;
  const done = filteredCards.filter(c => {
    const s = resolveStatus(c.status);
    return s && (s.key === 'done' || s.label.toLowerCase() === 'done');
  }).length;
  const inprog = filteredCards.filter(c => {
    const s = resolveStatus(c.status);
    return s && (s.key === 'inprogress' || s.key === 'ongoing');
  }).length;
  const stopped = filteredCards.filter(c => {
    const s = resolveStatus(c.status);
    return s && s.key === 'stopped';
  }).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-active').textContent = inprog;
  document.getElementById('stat-stopped').textContent = stopped;
}

function renderSidebar() {
  const nav = document.getElementById('status-nav');
  const counts = {};
  allCards.forEach(c => {
    const s = resolveStatus(c.status) || { label: c.status || 'Unknown', color: '#6b7280' };
    const label = s.label;
    counts[label] = (counts[label] || 0) + 1;
  });

  const allEl = document.createElement('div');
  allEl.className = 'nav-item' + (activeStatus === 'all' ? ' active' : '');
  allEl.innerHTML = `<span class="status-pill-nav" style="background:var(--muted)"></span> All <span class="count">${allCards.length}</span>`;
  allEl.onclick = () => setStatusFilter('all');
  nav.innerHTML = '';
  nav.appendChild(allEl);

  STATUSES.forEach(s => {
    const count = counts[s.label] || 0;
    if (count === 0 && !['inprogress','backlog','done'].includes(s.key)) return;
    const el = document.createElement('div');
    el.className = 'nav-item' + (activeStatus === s.label ? ' active' : '');
    el.innerHTML = `<span class="status-pill-nav" style="background:${s.color}"></span> ${s.label} <span class="count">${count}</span>`;
    el.onclick = () => setStatusFilter(s.label);
    nav.appendChild(el);
  });
}

function renderPeopleNav() {
  const nav = document.getElementById('people-nav');
  if (!nav) return;

  const allEl = document.createElement('div');
  allEl.className = 'nav-item' + (activeAssignee === 'all' ? ' active' : '');
  allEl.innerHTML = `<span class="status-pill-nav" style="background:var(--muted)"></span> All <span class="count">${allCards.length}</span>`;
  allEl.onclick = () => setAssigneeFilter('all');
  nav.innerHTML = '';
  nav.appendChild(allEl);

  // Unassigned count
  const unassignedCount = allCards.filter(c => !c.assignee).length;
  if (unassignedCount > 0) {
    const unEl = document.createElement('div');
    unEl.className = 'nav-item' + (activeAssignee === 'unassigned' ? ' active' : '');
    unEl.innerHTML = `<span class="status-pill-nav" style="background:var(--muted)"></span> Unassigned <span class="count">${unassignedCount}</span>`;
    unEl.onclick = () => setAssigneeFilter('unassigned');
    nav.appendChild(unEl);
  }

  allAssignees.forEach(a => {
    const count = allCards.filter(c => {
      if (!c.assignee) return false;
      let id;
      if (typeof c.assignee === 'string') id = c.assignee;
      else id = c.assignee.id || c.assignee._id || c.assignee.email || c.assignee.name || '';
      return id === a.id;
    }).length;
    if (count === 0) return;
    const initial = (a.name[0] || '?').toUpperCase();
    const el = document.createElement('div');
    el.className = 'nav-item' + (activeAssignee === a.id ? ' active' : '');
    el.innerHTML = `<span class="nav-avatar">${initial}</span> ${escHtml(a.name)} <span class="count">${count}</span>`;
    el.onclick = () => setAssigneeFilter(a.id);
    nav.appendChild(el);
  });
}

function renderTagFilter() {
  const container = document.getElementById('tag-filters');
  container.innerHTML = '';

  const all = document.createElement('button');
  all.className = 'filter-chip' + (activeTag === 'all' ? ' active' : '');
  all.textContent = 'All tags';
  all.onclick = () => setTagFilter('all');
  container.appendChild(all);

  allTags.slice(0, 12).forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (activeTag === tag ? ' active' : '');
    btn.textContent = tag;
    btn.onclick = () => setTagFilter(tag);
    container.appendChild(btn);
  });
}

function renderCards() {
  const area = document.getElementById('cards-area');
  area.innerHTML = '';

  if (currentView === 'board') {
    renderBoardView(area);
    return;
  }

  const container = document.createElement('div');
  container.className = currentView === 'list' ? 'cards-list' : 'cards-grid';

  if (filteredCards.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><p>No cards match your filters</p>`;
    container.appendChild(empty);
    area.appendChild(container);
    return;
  }

  filteredCards.forEach(card => {
    if (currentView === 'list') {
      container.appendChild(renderListCard(card));
    } else {
      container.appendChild(renderGridCard(card));
    }
  });
  area.appendChild(container);
}

function renderGridCard(card) {
  const s = resolveStatus(card.status) || { label: card.status || 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.2)' };
  const el = document.createElement('div');
  el.className = 'card';

  const tags = card.tags.slice(0, 3).map(t => {
    const label = typeof t === 'string' ? t : t.name || String(t);
    return `<span class="tag">${label}</span>`;
  }).join('');

  const due = card.due_date ? formatDate(card.due_date) : '';
  const isOverdue = card.due_date && new Date(card.due_date) < new Date() && s.key !== 'done';

  const p = String(card.priority ?? '').trim().toLowerCase();
  const pClass = p === 'high' ? 'priority-high' : p === 'medium' ? 'priority-medium' : p === 'low' ? 'priority-low' : '';
  const pLabel = p ? `<span class="priority ${pClass}">${p[0].toUpperCase()+p.slice(1)}</span>` : '';

  const a = card.assignee;
  let avatarHtml = '';
  if (a) {
    let aName, aInitial;
    if (typeof a === 'string') { aName = a; aInitial = a[0]?.toUpperCase() || '?'; }
    else { aName = a.name || a.fullName || a.username || 'User'; aInitial = (aName[0] || '?').toUpperCase(); }
    avatarHtml = `<span class="card-avatar" title="${escHtml(aName)}">${aInitial}</span>`;
  }

  el.innerHTML = `
    <div class="card-header">
      <div class="card-title">${escHtml(card.title)}</div>
      <span class="badge" style="background:${s.bg};color:${s.color};border:1px solid ${s.border}">
        <span style="width:5px;height:5px;border-radius:50%;background:${s.color};display:inline-block"></span>
        ${s.label}
      </span>
    </div>
    ${card.description ? `<div class="card-desc">${escHtml(card.description)}</div>` : ''}
    <div class="card-meta-row" style="margin-top:2px">
      ${pLabel}
    </div>
    <div class="card-footer">
      ${tags}
      <span style="margin-left:auto;display:flex;align-items:center;gap:0.4rem">
        ${avatarHtml}
        ${due ? `<span class="due${isOverdue?' overdue':''}">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          ${due}
        </span>` : ''}
      </span>
    </div>`;

  el.style.borderLeft = `3px solid ${s.color}`;
  el.onclick = () => openModal(card);
  return el;
}

function renderListCard(card) {
  const s = resolveStatus(card.status) || { label: card.status || 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.2)' };
  const el = document.createElement('div');
  el.className = 'list-card';

  const tags = card.tags.slice(0, 3).map(t => {
    const label = typeof t === 'string' ? t : t.name || String(t);
    return `<span class="tag">${label}</span>`;
  }).join('');

  const a = card.assignee;
  let avatarHtml = '';
  if (a) {
    let aName, aInitial;
    if (typeof a === 'string') { aName = a; aInitial = a[0]?.toUpperCase() || '?'; }
    else { aName = a.name || a.fullName || a.username || 'User'; aInitial = (aName[0] || '?').toUpperCase(); }
    avatarHtml = `<span class="card-avatar" title="${escHtml(aName)}">${aInitial}</span>`;
  }

  el.innerHTML = `
    <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
    <span class="list-title">${escHtml(card.title)}</span>
    <div class="list-tags">${tags}</div>
    ${avatarHtml}
    <span class="badge" style="background:${s.bg};color:${s.color};border:1px solid ${s.border};margin-left:auto;flex-shrink:0">
      ${s.label}
    </span>`;

  el.onclick = () => openModal(card);
  return el;
}

function buildBoardColumns() {
  if (activeBoard !== 'all' && boardColumns && boardColumns.length > 0) {
    const colNameMap = {};
    boardColumns.forEach(col => {
      const key = col.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      colNameMap[key] = { label: col.name, color: col.color || '#6b7280', id: col.id, cards: [] };
    });

    filteredCards.forEach(card => {
      const rawStatus = (card.status || '').toLowerCase().trim();
      const s = resolveStatus(card.status);
      const statusKey = rawStatus.replace(/[^a-z0-9]/g, '');
      const labelKey = s ? s.label.toLowerCase().replace(/[^a-z0-9]/g, '') : statusKey;

      const matchedKey = Object.keys(colNameMap).find(k =>
        k === statusKey || k === labelKey || k === rawStatus
      );
      if (matchedKey) {
        colNameMap[matchedKey].cards.push(card);
        return;
      }

      const firstCol = Object.keys(colNameMap)[0];
      if (firstCol) colNameMap[firstCol].cards.push(card);
    });

    return Object.values(colNameMap);
  }

  const grouped = {};
  STATUSES.forEach(s => { grouped[s.label] = []; });
  grouped['Other'] = [];
  filteredCards.forEach(card => {
    const s = resolveStatus(card.status);
    const label = s ? s.label : 'Other';
    if (grouped[label] !== undefined) grouped[label].push(card);
    else grouped['Other'].push(card);
  });
  return [...STATUSES.map(s => ({ label: s.label, color: s.color, cards: grouped[s.label] || [] })),
          { label: 'Other', color: '#6b7280', cards: grouped['Other'] || [] }];
}

function renderBoardView(area) {
  const wrapper = document.createElement('div');
  wrapper.className = 'board-view';

  const columnsToRender = buildBoardColumns();

  columnsToRender.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'board-col';
    colEl.innerHTML = `
      <div class="board-col-header">
        <span style="width:7px;height:7px;border-radius:50%;background:${col.color}"></span>
        ${col.label}
        <span class="board-col-count">${col.cards.length}</span>
      </div>
      <div class="board-col-cards">
        ${col.cards.length === 0 ? `<div class="board-card" style="opacity:0.4;cursor:default"><div class="board-card-title" style="font-size:11px;color:var(--muted)">Empty</div></div>` : ''}
        ${col.cards.map(card => {
          const tags = card.tags.slice(0, 2).map(t => {
            const label = typeof t === 'string' ? t : t.name || String(t);
            return `<span class="tag">${label}</span>`;
          }).join('');
          const a = card.assignee;
          let avatarHtml = '';
          if (a) {
            let aName, aInitial;
            if (typeof a === 'string') { aName = a; aInitial = a[0]?.toUpperCase() || '?'; }
            else { aName = a.name || a.fullName || a.username || 'User'; aInitial = (aName[0] || '?').toUpperCase(); }
            avatarHtml = `<span class="card-avatar" title="${escHtml(aName)}">${aInitial}</span>`;
          }
          return `<div class="board-card" onclick="window._openCard('${card.id}')">
            <div class="board-card-title">${escHtml(card.title)}</div>
            <div class="board-card-meta">${tags} ${avatarHtml}</div>
          </div>`;
        }).join('')}
      </div>`;
    wrapper.appendChild(colEl);
  });

  area.appendChild(wrapper);
}

// ─── Modal ──────────────────────────────────────────
function openModal(card) {
  const s = resolveStatus(card.status) || { label: card.status || 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.2)' };
  const tags = card.tags.map(t => {
    const label = typeof t === 'string' ? t : t.name || String(t);
    return `<span class="tag">${label}</span>`;
  }).join(' ');

  const p = String(card.priority ?? '').trim().toLowerCase();
  const pClass = p === 'high' ? 'priority-high' : p === 'medium' ? 'priority-medium' : p === 'low' ? 'priority-low' : '';
  const priorityHtml = p ? `<span class="priority ${pClass}">${p[0].toUpperCase()+p.slice(1)} priority</span>` : '<span style="color:var(--muted)">None</span>';

  const a = card.assignee;
  let assigneeHtml = '<span style="color:var(--muted)">Unassigned</span>';
  if (a) {
    let aName, aInitial;
    if (typeof a === 'string') { aName = a; aInitial = a[0]?.toUpperCase() || '?'; }
    else { aName = a.name || a.fullName || a.username || 'User'; aInitial = (aName[0] || '?').toUpperCase(); }
    assigneeHtml = `<span class="card-avatar" style="width:22px;height:22px;font-size:10px">${aInitial}</span> <span style="font-size:13px">${escHtml(aName)}</span>`;
  }

  document.getElementById('modal-title').textContent = card.title;
  document.getElementById('modal-status').innerHTML = `<span class="badge" style="background:${s.bg};color:${s.color};border:1px solid ${s.border}"><span style="width:6px;height:6px;border-radius:50%;background:${s.color};display:inline-block"></span>${s.label}</span>`;
  document.getElementById('modal-tags').innerHTML = tags || '<span style="color:var(--muted)">None</span>';
  document.getElementById('modal-desc').textContent = card.description || 'No description';
  document.getElementById('modal-id').textContent = card.id;
  document.getElementById('modal-created').textContent = card.created_at ? formatDate(card.created_at) : '—';
  document.getElementById('modal-updated').textContent = card.updated_at ? formatDate(card.updated_at) : '—';
  document.getElementById('modal-due').textContent = card.due_date ? formatDate(card.due_date) : '—';

  // Inject priority and assignee into modal if containers exist, else append rows
  let extra = document.getElementById('modal-extra');
  if (!extra) {
    extra = document.createElement('div');
    extra.id = 'modal-extra';
    extra.className = 'modal-row';
    const modal = document.querySelector('.modal');
    const descSection = document.getElementById('modal-desc').parentElement;
    modal.insertBefore(extra, descSection);
  }
  extra.innerHTML = `
    <div class="modal-section">
      <div class="modal-section-label">Priority</div>
      <div class="modal-section-value">${priorityHtml}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">Assignee</div>
      <div class="modal-section-value" style="display:flex;align-items:center;gap:0.4rem">${assigneeHtml}</div>
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('open');
}

window._openCard = (id) => {
  const card = allCards.find(c => c.id === id);
  if (card) openModal(card);
};

// ─── Controls ───────────────────────────────────────
function setStatusFilter(status) {
  activeStatus = status;
  applyFilters();
  renderSidebar();
}

function setTagFilter(tag) {
  activeTag = tag;
  applyFilters();
  renderTagFilter();
}

function setAssigneeFilter(id) {
  activeAssignee = id;
  applyFilters();
  renderPeopleNav();
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  renderCards();
}

// ─── Helpers ────────────────────────────────────────
function showLoading(show) {
  document.getElementById('loading-state').style.display = show ? 'flex' : 'none';
  document.getElementById('main-content').style.display = show ? 'none' : 'block';
}
function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent = `⚠ API Error: ${msg} — showing demo data`;
  el.style.display = 'block';
}
function hideError() {
  document.getElementById('error-banner').style.display = 'none';
}
function updateLastUpdated() {
  document.getElementById('last-updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return String(d); }
}

// ─── Demo Data ──────────────────────────────────────
function getDemoCards() {
  const statuses = ['In progress','Backlog','Testing','Development','Almost Done','Done','Stopped','Ongoing','Maybe?','Not now'];
  const tags = [['frontend','UI'],['backend','API'],['design'],['mobile'],['infra','devops'],['auth'],['bug'],['feature']];
  const titles = [
    'Redesign onboarding flow','Fix auth token refresh','Payment gateway integration',
    'Mobile push notifications','Dark mode implementation','API rate limiting',
    'Performance profiling','User dashboard v2','Email notification system',
    'Search indexing','Data export feature','Admin panel redesign',
    'CI/CD pipeline setup','Error monitoring','A/B testing framework',
    'Customer support chat','Analytics dashboard','SSO integration',
    'Audit logging','Webhook delivery system'
  ];
  const people = [
    { id: 'u1', name: 'Alice Chen', avatar: null },
    { id: 'u2', name: 'Bob Martinez', avatar: null },
    { id: 'u3', name: 'Carol Smith', avatar: null },
    { id: 'u4', name: 'David Kim', avatar: null },
  ];
  return titles.map((t, i) => ({
    id: `demo-${i}`,
    title: t,
    description: `This is a demo card for "${t}". Connect to Fizzi API to see real data.`,
    status: statuses[i % statuses.length],
    tags: tags[i % tags.length],
    priority: ['high','medium','low'][i % 3],
    assignee: i % 5 === 0 ? null : people[i % people.length],
    due_date: i % 3 === 0 ? new Date(Date.now() + (i - 5) * 86400000 * 7).toISOString() : null,
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    _raw: {},
  }));
}

async function loadAdvancedStats() {
  try {
    const qs = buildQuery();
    const res = await fetch(`/api/stats/summary${qs ? '?' + qs : ''}`);
    if (!res.ok) return;
    const data = await res.json();
    renderAdvancedStats(data.summary);
  } catch(e) { console.error('stats error', e); }
}

function renderAdvancedStats(stats) {
  if (!stats) return;
  const el = document.getElementById('adv-completion');
  if (el) el.textContent = stats.completionRate + '%';
  const bar = document.getElementById('adv-completion-bar');
  if (bar) bar.style.width = stats.completionRate + '%';
  const ov = document.getElementById('adv-overdue');
  if (ov) ov.textContent = stats.overdue;
}

async function loadStatsByStatus() {
  try {
    const qs = buildQuery();
    const res = await fetch(`/api/stats/by-status${qs ? '?' + qs : ''}`);
    if (!res.ok) return;
    const data = await res.json();
    renderStatusBars(data.byStatus);
  } catch(e) {}
}

function renderStatusBars(rows) {
  const container = document.getElementById('status-bars');
  if (!container || !rows) return;
  const max = Math.max(...rows.map(r => r.count), 1);
  container.innerHTML = rows.map(r => `
    <div class="bar-row">
      <span class="bar-label">${r.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.count/max*100)}%;background:${r.color}"></div></div>
      <span class="bar-count">${r.count}</span>
    </div>
  `).join('');
}

async function loadTopTags() {
  try {
    const qs = buildQuery();
    const res = await fetch(`/api/stats/by-tag${qs ? '?' + qs : ''}`);
    if (!res.ok) return;
    const data = await res.json();
    renderTopTags(data.byTag);
  } catch(e) {}
}

function renderTopTags(tags) {
  const container = document.getElementById('top-tags');
  if (!container || !tags) return;
  const max = Math.max(...tags.map(t => t.count), 1);
  container.innerHTML = tags.map(t => `
    <div class="bar-row">
      <span class="bar-label">${t.tag}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(t.count/max*100)}%;background:var(--accent2)"></div></div>
      <span class="bar-count">${t.count}</span>
    </div>
  `).join('');
}

async function loadPriorityStats() {
  try {
    const qs = buildQuery();
    const res = await fetch(`/api/stats/by-priority${qs ? '?' + qs : ''}`);
    if (!res.ok) return;
    const data = await res.json();
    renderPriorityBars(data.byPriority);
  } catch(e) {}
}

function renderPriorityBars(p) {
  const container = document.getElementById('priority-bars');
  if (!container || !p) return;
  const rows = [
    { label: 'High', count: p.high || 0, color: '#f38ba8' },
    { label: 'Medium', count: p.medium || 0, color: '#fab387' },
    { label: 'Low', count: p.low || 0, color: '#a6e3a1' },
    { label: 'None', count: p.none || 0, color: 'var(--muted)' },
  ];
  const max = Math.max(...rows.map(r => r.count), 1);
  container.innerHTML = rows.map(r => `
    <div class="bar-row">
      <span class="bar-label">${r.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.count/max*100)}%;background:${r.color}"></div></div>
      <span class="bar-count">${r.count}</span>
    </div>
  `).join('');
}

async function loadVelocity() {
  try {
    const qs = buildQuery();
    const res = await fetch(`/api/stats/velocity${qs ? '?' + qs : ''}`);
    if (!res.ok) return;
    const data = await res.json();
    renderVelocityChart(data.velocity);
  } catch(e) {}
}

function renderVelocityChart(weeks) {
  const container = document.getElementById('velocity-chart');
  if (!container || !weeks) return;
  const max = Math.max(...weeks.map(w => w.count), 1);
  container.innerHTML = `<div class="velocity-chart">${weeks.map(w => `
    <div class="velocity-bar-wrap" title="${w.week}: ${w.count} done">
      <div class="velocity-count">${w.count}</div>
      <div class="velocity-bar" style="height:${(w.count/max*100)}%"></div>
      <div class="velocity-label">${w.label}</div>
    </div>
  `).join('')}</div>`;
}

async function refreshAll() {
  await loadData();
  await loadAdvancedStats();
  await loadStatsByStatus();
  await loadTopTags();
  await loadPriorityStats();
  await loadVelocity();
}

// ─── Init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  try {
    const saved = localStorage.getItem('fizzi-theme');
    if (saved === 'latte' || saved === 'mocha') applyTheme(saved);
  } catch(e) {}

  // Search
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    applyFilters();
  });

  // Board filter
  const boardSelect = document.getElementById('board-select');
  boardSelect.addEventListener('change', e => {
    activeBoard = e.target.value;
    refreshAll();
  });

  // Date filters
  const dateFromInput = document.getElementById('date-from');
  const dateToInput = document.getElementById('date-to');
  dateFromInput.addEventListener('change', e => {
    dateFrom = e.target.value;
    refreshAll();
  });
  dateToInput.addEventListener('change', e => {
    dateTo = e.target.value;
    refreshAll();
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  // Refresh
  document.getElementById('btn-refresh').addEventListener('click', refreshAll);

  // Theme toggle
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  // Modal close
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) {
      document.getElementById('modal-overlay').classList.remove('open');
    }
  });
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('modal-overlay').classList.remove('open');
  });

  loadBoards();
  refreshAll();
  setInterval(refreshAll, 60000);
});
