import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { SettingsContent } from '@/components/settings/settings-content';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { appDataCache } from '@/lib/app-data-cache';
import { getProgress, type UserProgress } from '@/lib/progress-api';
import { getQuitProfile, type QuitProfile } from '@/lib/quit-profile-api';
import { sessionStore } from '@/lib/session-store';

export function SettingsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(() => appDataCache.getProgress());
  const [quitProfile, setQuitProfile] = useState<QuitProfile | null>(() => appDataCache.getQuitProfile());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSettings = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    const token = sessionStore.getToken();
    if (!token) {
      router.replace('/welcome');
      return;
    }

    mode === 'refresh' ? setIsRefreshing(true) : setIsLoading(true);
    setError('');

    try {
      const [progressResult, profileResult] = await Promise.all([getProgress(token), getQuitProfile(token)]);
      appDataCache.setProgress(progressResult.progress);
      appDataCache.setQuitProfile(profileResult.quitProfile);
      setProgress(progressResult.progress);
      setQuitProfile(profileResult.quitProfile);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load settings.';
      if (message.toLowerCase().includes('quit profile')) {
        router.replace('/setup');
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const logout = useCallback(() => {
    sessionStore.clearToken();
    appDataCache.clear();
    router.replace('/welcome');
  }, [router]);

  if (isLoading && (!progress || !quitProfile)) {
    return <Screen centered><ThemedText type="headline" style={{ textAlign: 'center' }}>Loading settings...</ThemedText></Screen>;
  }

  if (!progress || !quitProfile) {
    return <Screen centered><ThemedText type="headline" style={{ textAlign: 'center' }}>{error || 'Unable to load settings.'}</ThemedText><Button label="Try again" onPress={() => loadSettings()} /></Screen>;
  }

  return (
    <SettingsContent
      progress={progress}
      quitProfile={quitProfile}
      error={error}
      isRefreshing={isRefreshing}
      onRefresh={() => loadSettings('refresh')}
      onRetry={() => loadSettings()}
      onBack={() => router.back()}
      onOpenHome={() => router.push('/home')}
      onOpenProgress={() => router.push('/progress')}
      onOpenPremium={() => router.push('/premium')}
      onOpenAchievements={() => router.push('/achievements')}
      onOpenSettings={() => router.push('/settings')}
      onLogout={logout}
    />
  );
}
