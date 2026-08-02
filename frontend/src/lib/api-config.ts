import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_BACKEND_PORT = '5000';

function hostFromExpo() {
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';

  return host ? `http://${host}:${DEFAULT_BACKEND_PORT}` : '';
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const expoHostUrl = hostFromExpo();
  if (expoHostUrl) {
    return expoHostUrl;
  }

  return Platform.OS === 'web' ? `http://localhost:${DEFAULT_BACKEND_PORT}` : `http://127.0.0.1:${DEFAULT_BACKEND_PORT}`;
}
