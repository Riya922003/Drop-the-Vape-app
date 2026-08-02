import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/app-foundation';
import { appDataCache } from '@/lib/app-data-cache';
import { getMe } from '@/lib/auth-api';
import { getQuitProfile } from '@/lib/quit-profile-api';
import { sessionStore } from '@/lib/session-store';

export default function EntryRoute() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [message, setMessage] = useState('Preparing your quit journey...');

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    let isMounted = true;
    let navigationTimer: ReturnType<typeof setTimeout> | undefined;

    function replaceWhenMounted(pathname: '/welcome' | '/onboarding' | '/home' | '/setup') {
      navigationTimer = setTimeout(() => {
        if (isMounted) {
          router.replace(pathname);
        }
      }, 100);
    }

    async function routeUser() {
      const token = sessionStore.getToken();

      if (!token) {
        replaceWhenMounted(sessionStore.isOnboardingComplete() ? '/welcome' : '/onboarding');
        return;
      }

      try {
        const meResult = await getMe(token);
        sessionStore.setUser(meResult.user);
      } catch {
        sessionStore.clearToken();
        sessionStore.clearUser();
        appDataCache.clear();
        if (isMounted) {
          setMessage('Please sign in again.');
        }
        replaceWhenMounted('/welcome');
        return;
      }

      try {
        const profileResult = await getQuitProfile(token);
        appDataCache.setQuitProfile(profileResult.quitProfile);
        replaceWhenMounted('/home');
      } catch {
        replaceWhenMounted('/setup');
      }
    }

    routeUser();

    return () => {
      isMounted = false;
      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
    };
  }, [rootNavigationState?.key, router]);

  return (
    <Screen centered>
      <ThemedText type="headline">{message}</ThemedText>
    </Screen>
  );
}
