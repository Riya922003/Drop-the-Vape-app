import type { UserProgress } from '@/lib/progress-api';
import type { QuitProfile } from '@/lib/quit-profile-api';

let cachedProgress: UserProgress | null = null;
let cachedQuitProfile: QuitProfile | null = null;

export const appDataCache = {
  getProgress() {
    return cachedProgress;
  },
  setProgress(progress: UserProgress) {
    cachedProgress = progress;
  },
  getQuitProfile() {
    return cachedQuitProfile;
  },
  setQuitProfile(profile: QuitProfile) {
    cachedQuitProfile = profile;
  },
  clear() {
    cachedProgress = null;
    cachedQuitProfile = null;
  },
};
