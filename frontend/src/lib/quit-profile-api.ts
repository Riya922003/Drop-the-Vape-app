import { getApiBaseUrl } from '@/lib/api-config';

export type QuitProfileInput = {
  quitReason: string;
  vapesPerWeek: number;
  vapingHistory: string;
  costPerVape: number;
  daysPerVape: number;
  quitGoal: string;
};

export type QuitProfile = QuitProfileInput & {
  id: string;
  userId: string;
  estimatedDailyVapeUsage: number;
  estimatedDailySpend: number;
  quitStartDate: string;
  setupCompletedAt: string;
  updatedAt: string;
};

const API_BASE_URL = getApiBaseUrl();

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Something went wrong. Please try again.');
  }

  return payload as T;
}

export async function createQuitProfile(token: string, input: QuitProfileInput) {
  const response = await fetch(`${API_BASE_URL}/quit-profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseResponse<{ quitProfile: QuitProfile }>(response);
}

export async function getQuitProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/quit-profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseResponse<{ quitProfile: QuitProfile }>(response);
}

export async function updateQuitProfile(token: string, input: Partial<QuitProfileInput>) {
  const response = await fetch(`${API_BASE_URL}/quit-profile/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseResponse<{ quitProfile: QuitProfile }>(response);
}
