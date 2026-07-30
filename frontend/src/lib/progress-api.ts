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
  goal: {
    label: string;
    current: number;
    target: number;
    percent: number;
  };
  milestones: ProgressMilestone[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Something went wrong. Please try again.');
  }

  return payload as T;
}

export async function getProgress(token: string) {
  const response = await fetch(`${API_BASE_URL}/progress/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseResponse<{ progress: UserProgress }>(response);
}
