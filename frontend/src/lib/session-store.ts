const TOKEN_KEY = 'drop-the-vape.session-token';
const ONBOARDING_KEY = 'drop-the-vape.onboarding-complete';
const SETUP_DRAFT_KEY = 'drop-the-vape.setup-draft';
let memoryToken: string | null = null;
let memoryOnboardingComplete = false;
let memorySetupDraft: string | null = null;

function getLocalStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

export const sessionStore = {
  getToken() {
    return getLocalStorage()?.getItem(TOKEN_KEY) ?? memoryToken;
  },
  setToken(token: string) {
    memoryToken = token;
    getLocalStorage()?.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    memoryToken = null;
    getLocalStorage()?.removeItem(TOKEN_KEY);
  },
  isOnboardingComplete() {
    return getLocalStorage()?.getItem(ONBOARDING_KEY) === 'true' || memoryOnboardingComplete;
  },
  setOnboardingComplete() {
    memoryOnboardingComplete = true;
    getLocalStorage()?.setItem(ONBOARDING_KEY, 'true');
  },
  getSetupDraft() {
    return getLocalStorage()?.getItem(SETUP_DRAFT_KEY) ?? memorySetupDraft;
  },
  setSetupDraft(value: string) {
    memorySetupDraft = value;
    getLocalStorage()?.setItem(SETUP_DRAFT_KEY, value);
  },
  clearSetupDraft() {
    memorySetupDraft = null;
    getLocalStorage()?.removeItem(SETUP_DRAFT_KEY);
  },
};

