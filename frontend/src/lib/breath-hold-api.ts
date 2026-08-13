import { getApiBaseUrl } from '@/lib/api-config';
import type { UserProgress } from '@/lib/progress-api';

export type BreathHoldStatus = 'available' | 'in_progress' | 'completed' | 'left' | 'missed';
export type BreathHoldFeeling = 'easy' | 'okay' | 'hard' | 'dizzy' | 'other';

export type BreathHoldAttempt = {
  id: string;
  localDate: string;
  status: BreathHoldStatus;
  holdSeconds: number | null;
  feeling: BreathHoldFeeling | null;
  note: string | null;
  startedAt: string | null;
  completedAt: string | null;
  leftAt: string | null;
  type?: 'attempt' | 'missed';
};

export type BreathHoldSummary = {
  todayStatus: BreathHoldStatus;
  todayAttempt: BreathHoldAttempt | null;
  currentStreak: number;
  bestHoldSeconds: number;
  lastHoldSeconds: number;
  completedCount: number;
  missedCount: number;
  leftCount: number;
  serverTimestamp: string;
};

export type BreathHoldTrendPoint = {
  localDate: string;
  holdSeconds: number;
};

const API_BASE_URL = getApiBaseUrl();

export function userTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Something went wrong. Please try again.');
  }

  return payload as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Timezone': userTimezone(),
  };
}

export async function getBreathHoldSummary(token: string) {
  const timezone = encodeURIComponent(userTimezone());
  const response = await fetch(`${API_BASE_URL}/breath-hold/summary?timezone=${timezone}`, {
    headers: authHeaders(token),
  });

  return parseResponse<{ summary: BreathHoldSummary }>(response);
}

export async function startBreathHold(token: string) {
  const response = await fetch(`${API_BASE_URL}/breath-hold/start`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ timezone: userTimezone() }),
  });

  return parseResponse<{ attempt: BreathHoldAttempt; summary: BreathHoldSummary }>(response);
}

export async function completeBreathHold(token: string, attemptId: string, payload: { holdSeconds: number; feeling: BreathHoldFeeling; note?: string }) {
  const response = await fetch(`${API_BASE_URL}/breath-hold/${attemptId}/complete`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ...payload, timezone: userTimezone() }),
  });

  return parseResponse<{ attempt: BreathHoldAttempt; summary: BreathHoldSummary; progress: UserProgress }>(response);
}

export async function leaveBreathHold(token: string, attemptId: string) {
  const response = await fetch(`${API_BASE_URL}/breath-hold/${attemptId}/leave`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ timezone: userTimezone() }),
  });

  return parseResponse<{ attempt: BreathHoldAttempt; summary: BreathHoldSummary }>(response);
}

export async function getBreathHoldHistory(token: string, limit = 30) {
  const timezone = encodeURIComponent(userTimezone());
  const response = await fetch(`${API_BASE_URL}/breath-hold/history?timezone=${timezone}&limit=${limit}`, {
    headers: authHeaders(token),
  });

  return parseResponse<{ history: BreathHoldAttempt[]; serverTimestamp: string }>(response);
}

export async function getBreathHoldTrend(token: string, days = 30) {
  const timezone = encodeURIComponent(userTimezone());
  const response = await fetch(`${API_BASE_URL}/breath-hold/trend?timezone=${timezone}&days=${days}`, {
    headers: authHeaders(token),
  });

  return parseResponse<{ trend: BreathHoldTrendPoint[]; serverTimestamp: string }>(response);
}
