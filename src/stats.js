const STATUS_LABELS = [
  'Not now',
  'Maybe?',
  'In progress',
  'Stopped',
  'Testing',
  'Development',
  'Almost',
  'Ongoing',
  'Backlog',
  'Done',
  'Almost Done',
];

const STATUS_COLORS = {
  'Not now': '#7f849c',
  'Maybe?': '#f9e2af',
  'In progress': '#89b4fa',
  'Stopped': '#f38ba8',
  'Testing': '#cba6f7',
  'Development': '#a6e3a1',
  'Almost': '#fab387',
  'Ongoing': '#74c7ec',
  'Backlog': '#6c7086',
  'Done': '#a6e3a1',
  'Almost Done': '#fab387',
};

function normalizeStatus(status) {
  return String(status ?? '').trim().toLowerCase();
}

function isStatus(cardStatus, target) {
  return normalizeStatus(cardStatus) === target.toLowerCase();
}

function formatDateYMD(date) {
  return date.toISOString().split('T')[0];
}

function isCardOverdue(card) {
  if (!card.due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(card.due_date);
  due.setHours(0, 0, 0, 0);
  return due < today && !isStatus(card.status, 'done');
}

function computeSummary(cards) {
  const total = cards.length;
  const done = cards.filter(c => isStatus(c.status, 'done')).length;
  const active = cards.filter(
    c => isStatus(c.status, 'in progress') || isStatus(c.status, 'ongoing')
  ).length;
  const stopped = cards.filter(c => isStatus(c.status, 'stopped')).length;
  const overdue = cards.filter(isCardOverdue).length;
  const completionRate = total === 0 ? 0 : parseFloat(((done / total) * 100).toFixed(1));

  return { total, done, active, stopped, overdue, completionRate };
}

function computeByStatus(cards) {
  const total = cards.length;

  return STATUS_LABELS.map(label => {
    const count = cards.filter(c => isStatus(c.status, label)).length;
    const percentage = total === 0 ? 0 : parseFloat(((count / total) * 100).toFixed(1));
    return {
      status: label.toLowerCase().replace(/\s+/g, ''),
      label,
      count,
      percentage,
      color: STATUS_COLORS[label],
    };
  });
}

function computeByTag(cards) {
  const tagCounts = {};

  for (const card of cards) {
    if (!Array.isArray(card.tags)) continue;
    for (const t of card.tags) {
      let tag;
      if (typeof t === 'string') {
        tag = t;
      } else if (t && typeof t === 'object' && 'name' in t) {
        tag = t.name;
      } else {
        tag = String(t);
      }
      tag = tag.trim();
      if (!tag) continue;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function computeByPriority(cards) {
  const result = { high: 0, medium: 0, low: 0, none: 0 };

  for (const card of cards) {
    const p = String(card.priority ?? '').trim().toLowerCase();
    if (p === 'high') result.high++;
    else if (p === 'medium') result.medium++;
    else if (p === 'low') result.low++;
    else result.none++;
  }

  return result;
}

function computeOverdue(cards) {
  return cards.filter(isCardOverdue);
}

function computeByAssignee(cards) {
  const result = {};

  for (const card of cards) {
    const raw = card.assignee;
    if (!raw) continue;

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

    if (!result[id]) {
      result[id] = { id, name, avatar, total: 0, done: 0, active: 0, overdue: 0 };
    }
    result[id].total++;
    if (isStatus(card.status, 'done')) result[id].done++;
    if (isStatus(card.status, 'in progress') || isStatus(card.status, 'ongoing')) result[id].active++;
    if (isCardOverdue(card)) result[id].overdue++;
  }

  return Object.values(result)
    .map(a => ({
      ...a,
      completionRate: a.total === 0 ? 0 : parseFloat(((a.done / a.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.total - a.total);
}

function computeVelocity(cards) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Most recent Sunday (if today is Sunday, use today)
  const mostRecentSunday = new Date(now);
  mostRecentSunday.setDate(now.getDate() - dayOfWeek);
  mostRecentSunday.setHours(23, 59, 59, 999);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(mostRecentSunday);
    weekEnd.setDate(mostRecentSunday.getDate() - (i * 7));
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const monday = new Date(weekStart);
    const label = `${monthNames[monday.getMonth()]} ${monday.getDate()}`;
    const week = formatDateYMD(monday);

    const count = cards.filter(c => {
      if (!isStatus(c.status, 'done')) return false;
      if (!c.updated_at) return false;
      const updated = new Date(c.updated_at);
      return updated >= weekStart && updated <= weekEnd;
    }).length;

    weeks.push({ week, label, count });
  }

  return weeks;
}

module.exports = {
  computeSummary,
  computeByStatus,
  computeByTag,
  computeByPriority,
  computeOverdue,
  computeVelocity,
  computeByAssignee,
};
