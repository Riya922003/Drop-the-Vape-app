import { getApiBaseUrl } from '@/lib/api-config';

export type ProgressMilestone = {
  key: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export type UserProgress = {
  serverTimestamp: string;
  quitStartDate: string;
  daysVapeFree: number;
  currentStreak: number;
  moneySaved: number;
  vapesAvoided: number;
  activities?: {
    breathHold?: {
      todayStatus: string;
      streak: number;
      bestHoldSeconds: number;
      lastHoldSeconds: number;
      completedCount: number;
    };
  };
  goal: {
    label: string;
    current: number;
    target: number;
    percent: number;
  };
  milestones: ProgressMilestone[];
};

const API_BASE_URL = getApiBaseUrl();

function userTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Something went wrong. Please try again.');
  }

  return payload as T;
}

export async function getProgress(token: string) {
  const timezone = encodeURIComponent(userTimezone());
  const response = await fetch(`${API_BASE_URL}/progress/me?timezone=${timezone}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Timezone': userTimezone() },
  });

  return parseResponse<{ progress: UserProgress }>(response);
}
