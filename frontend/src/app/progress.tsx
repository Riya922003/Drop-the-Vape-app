import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { getProgress, type UserProgress } from '@/lib/progress-api';
import { sessionStore } from '@/lib/session-store';

export default function ProgressRoute() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
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
        const result = await getProgress(token);
        setProgress(result.progress);
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
        <ThemedText type="headline" style={{ textAlign: 'center' }}>Loading your progress...</ThemedText>
      </Screen>
    );
  }

  if (!progress) {
    return (
      <Screen centered>
        <ThemedText type="headline" style={{ textAlign: 'center' }}>{error || 'Unable to load your progress.'}</ThemedText>
        <Button label="Try again" onPress={() => loadProgress()} />
      </Screen>
    );
  }

  return (
    <ProgressDashboard
      progress={progress}
      error={error}
      isRefreshing={isRefreshing}
      activeTab="progress"
      onRefresh={() => loadProgress('refresh')}
      onRetry={() => loadProgress()}
      onOpenAchievements={() => router.push('/achievements')}
      onOpenProfile={() => router.push('/profile')}
      onOpenHome={() => router.push('/home')}
      onOpenProgress={() => router.push('/progress')}
    />
  );
}
