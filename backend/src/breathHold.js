const crypto = require("crypto");

const VALID_STATUSES = new Set(["in_progress", "completed", "left"]);
const VALID_FEELINGS = new Set(["easy", "okay", "hard", "dizzy", "other"]);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function safeTimezone(timezone) {
  const value = String(timezone || "").trim();
  if (!value) return "UTC";

  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return "UTC";
  }
}

function localDateFor(timezone, now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone(timezone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function addDays(dateString, offset) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function wholeDaysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / MS_PER_DAY);
}

function mapAttempt(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    localDate: normalizeDate(row.local_date),
    status: row.status,
    holdSeconds: row.hold_seconds === null || row.hold_seconds === undefined ? null : Number(row.hold_seconds),
    feeling: row.feeling,
    note: row.note,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    leftAt: row.left_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function publicAttempt(row) {
  const attempt = mapAttempt(row);
  if (!attempt) return null;

  return {
    id: attempt.id,
    localDate: attempt.localDate,
    status: attempt.status,
    holdSeconds: attempt.holdSeconds,
    feeling: attempt.feeling,
    note: attempt.note,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    leftAt: attempt.leftAt,
  };
}

async function completedDates(query, userId) {
  const result = await query(
    `SELECT DISTINCT local_date
     FROM breath_hold_attempts
     WHERE user_id = $1 AND status = 'completed'
     ORDER BY local_date DESC`,
    [userId]
  );

  return result.rows.map((row) => normalizeDate(row.local_date));
}

function calculateStreak(dates, today) {
  const completed = new Set(dates);
  let cursor = completed.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

async function getBreathHoldSummary(query, userId, timezone) {
  const today = localDateFor(timezone);
  const [todayResult, statsResult, firstResult, dates] = await Promise.all([
    query(
      `SELECT *
       FROM breath_hold_attempts
       WHERE user_id = $1 AND local_date = $2
       ORDER BY
         CASE status WHEN 'completed' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
         updated_at DESC
       LIMIT 1`,
      [userId, today]
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
         COUNT(*) FILTER (WHERE status = 'left') AS left_count,
         MAX(hold_seconds) FILTER (WHERE status = 'completed') AS best_hold_seconds,
         (
           SELECT hold_seconds
           FROM breath_hold_attempts latest
           WHERE latest.user_id = $1 AND latest.status = 'completed'
           ORDER BY latest.completed_at DESC
           LIMIT 1
         ) AS last_hold_seconds
       FROM breath_hold_attempts
       WHERE user_id = $1`,
      [userId]
    ),
    query("SELECT MIN(local_date) AS first_local_date FROM breath_hold_attempts WHERE user_id = $1", [userId]),
    completedDates(query, userId),
  ]);

  const todayAttempt = publicAttempt(todayResult.rows[0]);
  const todayStatus = todayAttempt?.status ?? "available";
  const firstLocalDate = normalizeDate(firstResult.rows[0]?.first_local_date);
  const completedBeforeToday = dates.filter((date) => date < today).length;
  const expectedBeforeToday = firstLocalDate ? wholeDaysBetween(firstLocalDate, today) : 0;
  const missedCount = Math.max(0, expectedBeforeToday - completedBeforeToday);
  const stats = statsResult.rows[0] || {};

  return {
    todayStatus,
    todayAttempt,
    currentStreak: calculateStreak(dates, today),
    bestHoldSeconds: stats.best_hold_seconds ? Number(stats.best_hold_seconds) : 0,
    lastHoldSeconds: stats.last_hold_seconds ? Number(stats.last_hold_seconds) : 0,
    completedCount: Number(stats.completed_count || 0),
    missedCount,
    leftCount: Number(stats.left_count || 0),
    serverTimestamp: new Date().toISOString(),
  };
}

async function startBreathHold(query, userId, timezone) {
  const today = localDateFor(timezone);
  const existing = await query(
    `SELECT *
     FROM breath_hold_attempts
     WHERE user_id = $1 AND local_date = $2 AND status IN ('completed', 'in_progress')
     ORDER BY CASE status WHEN 'completed' THEN 0 ELSE 1 END, updated_at DESC
     LIMIT 1`,
    [userId, today]
  );

  if (existing.rows[0]) {
    return { attempt: publicAttempt(existing.rows[0]), summary: await getBreathHoldSummary(query, userId, timezone) };
  }

  try {
    const result = await query(
      `INSERT INTO breath_hold_attempts (id, user_id, local_date, status, started_at, updated_at)
       VALUES ($1, $2, $3, 'in_progress', now(), now())
       RETURNING *`,
      [crypto.randomUUID(), userId, today]
    );

    return { attempt: publicAttempt(result.rows[0]), summary: await getBreathHoldSummary(query, userId, timezone) };
  } catch (error) {
    if (error.code !== "23505") throw error;

    const raced = await query(
      `SELECT *
       FROM breath_hold_attempts
       WHERE user_id = $1 AND local_date = $2 AND status IN ('completed', 'in_progress')
       ORDER BY CASE status WHEN 'completed' THEN 0 ELSE 1 END, updated_at DESC
       LIMIT 1`,
      [userId, today]
    );
    return { attempt: publicAttempt(raced.rows[0]), summary: await getBreathHoldSummary(query, userId, timezone) };
  }
}

async function completeBreathHold(query, userId, attemptId, input) {
  const holdSeconds = Number(input.holdSeconds);
  const feeling = input.feeling ? String(input.feeling) : null;
  const note = input.note ? String(input.note).trim().slice(0, 500) : null;

  if (!Number.isInteger(holdSeconds) || holdSeconds <= 0) {
    const error = new Error("Please provide a valid hold duration.");
    error.statusCode = 400;
    throw error;
  }

  if (feeling && !VALID_FEELINGS.has(feeling)) {
    const error = new Error("Please provide a valid feeling value.");
    error.statusCode = 400;
    throw error;
  }

  const attemptResult = await query("SELECT * FROM breath_hold_attempts WHERE id = $1 AND user_id = $2", [attemptId, userId]);
  const attempt = attemptResult.rows[0];

  if (!attempt) {
    const error = new Error("Breath hold attempt was not found.");
    error.statusCode = 404;
    throw error;
  }

  if (attempt.status === "completed") {
    return { attempt: publicAttempt(attempt), summary: await getBreathHoldSummary(query, userId, input.timezone) };
  }

  const completedToday = await query(
    "SELECT * FROM breath_hold_attempts WHERE user_id = $1 AND local_date = $2 AND status = 'completed' LIMIT 1",
    [userId, normalizeDate(attempt.local_date)]
  );

  if (completedToday.rows[0]) {
    return { attempt: publicAttempt(completedToday.rows[0]), summary: await getBreathHoldSummary(query, userId, input.timezone) };
  }

  try {
    const result = await query(
      `UPDATE breath_hold_attempts
       SET status = 'completed', hold_seconds = $1, feeling = $2, note = $3,
           completed_at = now(), left_at = NULL, updated_at = now()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [holdSeconds, feeling, note, attemptId, userId]
    );

    return { attempt: publicAttempt(result.rows[0]), summary: await getBreathHoldSummary(query, userId, input.timezone) };
  } catch (error) {
    if (error.code !== "23505") throw error;

    const existingCompleted = await query(
      "SELECT * FROM breath_hold_attempts WHERE user_id = $1 AND local_date = $2 AND status = 'completed' LIMIT 1",
      [userId, normalizeDate(attempt.local_date)]
    );
    return { attempt: publicAttempt(existingCompleted.rows[0]), summary: await getBreathHoldSummary(query, userId, input.timezone) };
  }
}

async function leaveBreathHold(query, userId, attemptId, timezone) {
  const result = await query(
    `UPDATE breath_hold_attempts
     SET status = 'left', left_at = now(), updated_at = now()
     WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
     RETURNING *`,
    [attemptId, userId]
  );

  if (result.rows[0]) {
    return { attempt: publicAttempt(result.rows[0]), summary: await getBreathHoldSummary(query, userId, timezone) };
  }

  const existing = await query("SELECT * FROM breath_hold_attempts WHERE id = $1 AND user_id = $2", [attemptId, userId]);
  if (!existing.rows[0]) {
    const error = new Error("Breath hold attempt was not found.");
    error.statusCode = 404;
    throw error;
  }

  return { attempt: publicAttempt(existing.rows[0]), summary: await getBreathHoldSummary(query, userId, timezone) };
}

async function getBreathHoldHistory(query, userId, timezone, limit = 30) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 90));
  const today = localDateFor(timezone);
  const attempts = await query(
    `SELECT *
     FROM breath_hold_attempts
     WHERE user_id = $1
     ORDER BY local_date DESC, updated_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );
  const first = await query("SELECT MIN(local_date) AS first_local_date FROM breath_hold_attempts WHERE user_id = $1", [userId]);
  const dates = await completedDates(query, userId);
  const completed = new Set(dates);
  const rows = attempts.rows.map((row) => ({ type: "attempt", ...publicAttempt(row) }));
  const firstDate = normalizeDate(first.rows[0]?.first_local_date);

  if (firstDate) {
    let cursor = addDays(today, -1);
    while (rows.length < safeLimit && cursor >= firstDate) {
      const hasRow = rows.some((row) => row.localDate === cursor);
      if (!hasRow && !completed.has(cursor)) {
        rows.push({ type: "missed", id: `missed-${cursor}`, localDate: cursor, status: "missed", holdSeconds: null, feeling: null, note: null, startedAt: null, completedAt: null, leftAt: null });
      }
      cursor = addDays(cursor, -1);
    }
  }

  rows.sort((a, b) => b.localDate.localeCompare(a.localDate));
  return { history: rows.slice(0, safeLimit), serverTimestamp: new Date().toISOString() };
}

async function getBreathHoldTrend(query, userId, timezone, days = 30) {
  const safeDays = Math.max(7, Math.min(Number(days) || 30, 90));
  const today = localDateFor(timezone);
  const startDate = addDays(today, -(safeDays - 1));
  const result = await query(
    `SELECT local_date, MAX(hold_seconds) AS hold_seconds
     FROM breath_hold_attempts
     WHERE user_id = $1 AND status = 'completed' AND local_date >= $2 AND local_date <= $3
     GROUP BY local_date
     ORDER BY local_date ASC`,
    [userId, startDate, today]
  );

  return {
    trend: result.rows.map((row) => ({ localDate: normalizeDate(row.local_date), holdSeconds: Number(row.hold_seconds || 0) })),
    serverTimestamp: new Date().toISOString(),
  };
}

function isValidStatus(status) {
  return VALID_STATUSES.has(status);
}

module.exports = {
  completeBreathHold,
  getBreathHoldHistory,
  getBreathHoldSummary,
  getBreathHoldTrend,
  isValidStatus,
  leaveBreathHold,
  localDateFor,
  startBreathHold,
};
