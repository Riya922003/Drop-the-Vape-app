import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { HomeDashboard } from '@/components/home/home-dashboard';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { appDataCache } from '@/lib/app-data-cache';
import { getMe } from '@/lib/auth-api';
import { getProgress, type UserProgress } from '@/lib/progress-api';
import { sessionStore } from '@/lib/session-store';

export default function HomeRoute() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(() => appDataCache.getProgress());
  const [userName, setUserName] = useState(() => sessionStore.getUser()?.name ?? 'there');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProgress = useCallback(
    async (mode: 'load' | 'refresh' = 'load') => {
      const token = sessionStore.getToken();
      if (!token) {
        router.replace('/welcome');
        return;
      }

      mode === 'refresh' ? setIsRefreshing(true) : setIsLoading(true);
      setError('');

      try {
        const [progressResult, meResult] = await Promise.all([getProgress(token), getMe(token)]);
        appDataCache.setProgress(progressResult.progress);
        sessionStore.setUser(meResult.user);
        setProgress(progressResult.progress);
        setUserName(meResult.user.name);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load your progress.';
        if (message.toLowerCase().includes('quit profile')) {
          router.replace('/setup');
          return;
        }
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (isLoading && !progress) {
    return (
      <Screen centered>
        <ThemedText type="headline" style={{ textAlign: 'center' }}>Loading your dashboard...</ThemedText>
      </Screen>
    );
  }

  if (!progress) {
    return (
      <Screen centered>
        <ThemedText type="headline" style={{ textAlign: 'center' }}>{error || 'Unable to load your dashboard.'}</ThemedText>
        <Button label="Try again" onPress={() => loadProgress()} />
      </Screen>
    );
  }

  return (
    <HomeDashboard
      progress={progress}
      userName={userName}
      error={error}
      isRefreshing={isRefreshing}
      onRefresh={() => loadProgress('refresh')}
      onRetry={() => loadProgress()}
      onOpenAchievements={() => router.push('/achievements')}
      onOpenProfile={() => router.push('/profile')}
      onOpenHome={() => router.push('/home')}
      onOpenProgress={() => router.push('/progress')}
      onOpenPremium={() => router.push('/premium')}
    />
  );
}
