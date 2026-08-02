import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabs } from '@/components/navigation/bottom-tabs';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { appDataCache } from '@/lib/app-data-cache';
import { getProgress, type ProgressMilestone, type UserProgress } from '@/lib/progress-api';
import { sessionStore } from '@/lib/session-store';

const badgeImages = {
  gold: require('@/assets/drop-the-vape/dashboard/1.png'),
  blue: require('@/assets/drop-the-vape/dashboard/2.png'),
  purple: require('@/assets/drop-the-vape/dashboard/3.png'),
  orange: require('@/assets/drop-the-vape/dashboard/4.png'),
};
const heroTrophy = badgeImages.orange;

const dayTargets: Record<string, number> = {
  first_day: 1,
  one_week: 7,
  two_weeks: 14,
  one_month: 30,
  hundred_days: 100,
  one_year: 365,
  vape_free_hero: 365,
};

const moneyTargets: Record<string, number> = {
  saved_50: 50,
  saved_100: 100,
};

const categoryByKey: Record<string, 'Streak' | 'Health' | 'Savings' | 'Goals'> = {
  first_day: 'Streak',
  one_week: 'Streak',
  two_weeks: 'Streak',
  one_month: 'Streak',
  hundred_days: 'Streak',
  one_year: 'Streak',
  streak_7: 'Streak',
  healthy_heart: 'Health',
  better_lungs: 'Health',
  saved_50: 'Savings',
  saved_100: 'Savings',
  avoided_100: 'Goals',
  vape_free_hero: 'Goals',
};

const imageByKey: Record<string, number> = {
  first_day: badgeImages.gold,
  one_week: badgeImages.gold,
  two_weeks: badgeImages.orange,
  streak_7: badgeImages.blue,
  healthy_heart: badgeImages.purple,
  better_lungs: badgeImages.purple,
  saved_50: badgeImages.blue,
  saved_100: badgeImages.blue,
  avoided_100: badgeImages.purple,
  vape_free_hero: badgeImages.orange,
};

const fallbackMilestones: ProgressMilestone[] = [
  { key: 'first_day', label: 'First Day', description: '24 hours vape-free', unlocked: false },
  { key: 'one_week', label: 'First Week', description: '7 days vape-free', unlocked: false },
  { key: 'one_month', label: '30 Days', description: '30 days vape-free', unlocked: false },
  { key: 'hundred_days', label: '100 Days', description: '100 days vape-free', unlocked: false },
];

type AchievementFilter = 'All' | 'Streak' | 'Health' | 'Savings' | 'Goals';

const achievementFilters: AchievementFilter[] = ['All', 'Streak', 'Health', 'Savings', 'Goals'];

function currentProgressValue(progress: UserProgress, badge: ProgressMilestone) {
  if (moneyTargets[badge.key]) {
    return progress.moneySaved;
  }
  if (badge.key === 'streak_7') {
    return progress.currentStreak;
  }
  return progress.daysVapeFree;
}

function targetForBadge(badge: ProgressMilestone) {
  if (moneyTargets[badge.key]) {
    return moneyTargets[badge.key];
  }
  if (badge.key === 'streak_7') {
    return 7;
  }
  if (badge.key === 'healthy_heart') {
    return 1;
  }
  if (badge.key === 'better_lungs') {
    return 14;
  }
  return dayTargets[badge.key] ?? 1;
}

function badgeCategory(badge: ProgressMilestone) {
  return categoryByKey[badge.key] ?? 'Goals';
}

function badgeAccent(badge: ProgressMilestone) {
  const category = badgeCategory(badge);
  if (category === 'Health') return '#DC2626';
  if (category === 'Savings') return '#22C55E';
  if (category === 'Streak') return '#3B82F6';
  return '#64748B';
}

function firstLockedBadge(badges: ProgressMilestone[]) {
  return badges.find((badge) => !badge.unlocked) ?? badges[badges.length - 1];
}

function percentFor(progress: UserProgress, badge: ProgressMilestone) {
  const target = targetForBadge(badge);
  return Math.min(100, Math.round((currentProgressValue(progress, badge) / target) * 100));
}

function displayCurrent(progress: UserProgress, badge: ProgressMilestone) {
  const current = Math.min(currentProgressValue(progress, badge), targetForBadge(badge));
  return moneyTargets[badge.key] ? `$${Math.round(current)}` : String(Math.floor(current));
}

function lockedDayLabel(badge: ProgressMilestone) {
  const target = targetForBadge(badge);
  if (target >= 365) {
    return '1Y';
  }
  return String(target);
}

function AchievementsContent({
  progress,
  error,
  isRefreshing,
  onRefresh,
  onRetry,
  onOpenHome,
  onOpenProgress,
  onOpenPremium,
  onOpenAchievements,
  onOpenProfile,
}: {
  progress: UserProgress;
  error?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onOpenHome: () => void;
  onOpenProgress: () => void;
  onOpenPremium: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState<AchievementFilter>('All');
  const badges = progress.milestones.length ? progress.milestones : fallbackMilestones;
  const filteredBadges = selectedFilter === 'All' ? badges : badges.filter((badge) => badgeCategory(badge) === selectedFilter);
  const next = firstLockedBadge(badges);
  const nextPercent = percentFor(progress, next);

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <ThemedText type="title" style={styles.title}>Achievements</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>Every milestone is proof that you're making progress. Keep going!</ThemedText>
          </View>
          <Image source={heroTrophy} style={styles.headerImage} contentFit="contain" />
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.error}>{error}</ThemedText><Button label="Try again" onPress={onRetry} /></View> : null}

        <View style={styles.nextCard}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Next Achievement</ThemedText>
          <View style={styles.nextRow}>
            <NumberBadge badge={next} locked />
            <View style={styles.nextProgressBlock}>
              <ThemedText type="smallBold" style={styles.nextTitle}>{next.label} Vape-Free</ThemedText>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${nextPercent}%` }]} /></View>
            </View>
            <ThemedText type="smallBold" style={styles.nextNumbers}>{displayCurrent(progress, next)} / {targetForBadge(next)}</ThemedText>
          </View>
        </View>

        <View style={styles.badgesHeader}>
          <ThemedText type="headline" style={styles.badgesTitle}>All Badges</ThemedText>
          <View style={styles.filterRow}>
            {achievementFilters.map((item) => {
              const isActive = selectedFilter === item;
              return (
                <Pressable key={item} onPress={() => setSelectedFilter(item)} style={({ pressed }) => [styles.filterPill, isActive && styles.filterActive, pressed && styles.pressed]}>
                  <ThemedText style={[styles.filterText, isActive && styles.filterTextActive]}>{item}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.badgeGrid}>{filteredBadges.map((badge) => <BadgeCard key={badge.key} badge={badge} />)}</View>
      </ScrollView>
      <BottomTabs active="achievements" onOpenHome={onOpenHome} onOpenProgress={onOpenProgress} onOpenPremium={onOpenPremium} onOpenAchievements={onOpenAchievements} onOpenRightTab={onOpenProfile} />
    </Screen>
  );
}

function BadgeCard({ badge }: { badge: ProgressMilestone }) {
  const accent = badgeAccent(badge);
  const category = badgeCategory(badge);

  return (
    <View style={[styles.badgeCard, { borderColor: badge.unlocked ? `${accent}55` : '#EAF5FF' }, !badge.unlocked && styles.lockedCard]}>
      <View style={[styles.badgeAccentRail, { backgroundColor: accent }]} />
      <View style={[styles.badgeIconShell, { backgroundColor: badge.unlocked ? `${accent}18` : '#EAF5FF' }]}>
        {imageByKey[badge.key] && badge.unlocked ? <Image source={imageByKey[badge.key]} style={styles.badgeImage} contentFit="contain" /> : <NumberBadge badge={badge} locked={!badge.unlocked} />}
      </View>
      <View style={styles.badgeCopy}>
        <ThemedText type="smallBold" style={styles.badgeTitle} numberOfLines={2}>{badge.label}</ThemedText>
        <View style={[styles.badgeCategoryPill, { backgroundColor: `${accent}14` }]}>
          <ThemedText style={[styles.badgeCategory, { color: accent }]}>{category}</ThemedText>
        </View>
      </View>
      <View style={[styles.statusChip, badge.unlocked ? styles.statusUnlocked : styles.statusLocked]}><ThemedText style={[styles.statusText, !badge.unlocked && styles.statusTextLocked]}>{badge.unlocked ? 'Earned' : 'Locked'}</ThemedText></View>
    </View>
  );
}
function NumberBadge({ badge, locked }: { badge: ProgressMilestone; locked?: boolean }) {
  return <View style={[styles.numberBadge, locked && styles.numberBadgeLocked]}><ThemedText style={[styles.numberBadgeText, locked && styles.numberBadgeTextLocked]}>{lockedDayLabel(badge)}</ThemedText><ThemedText style={[styles.numberBadgeSub, locked && styles.numberBadgeTextLocked]}>{targetForBadge(badge) >= 365 ? 'YEAR' : 'DAYS'}</ThemedText></View>;
}

export function AchievementsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(() => appDataCache.getProgress());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProgress = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    const token = sessionStore.getToken();
    if (!token) {
      router.replace('/welcome');
      return;
    }

    mode === 'refresh' ? setIsRefreshing(true) : setIsLoading(true);
    setError('');

    try {
      const result = await getProgress(token);
      appDataCache.setProgress(result.progress);
      setProgress(result.progress);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load achievements.';
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
    loadProgress();
  }, [loadProgress]);

  if (isLoading && !progress) {
    return <Screen centered><ThemedText type="headline" style={{ textAlign: 'center' }}>Loading achievements...</ThemedText></Screen>;
  }

  if (!progress) {
    return <Screen centered><ThemedText type="headline" style={{ textAlign: 'center' }}>{error || 'Unable to load achievements.'}</ThemedText><Button label="Try again" onPress={() => loadProgress()} /></Screen>;
  }

  return (
    <AchievementsContent
      progress={progress}
      error={error}
      isRefreshing={isRefreshing}
      onRefresh={() => loadProgress('refresh')}
      onRetry={() => loadProgress()}
      onOpenHome={() => router.push('/home')}
      onOpenProgress={() => router.push('/progress')}
      onOpenPremium={() => router.push('/premium')}
      onOpenAchievements={() => router.push('/achievements')}
      onOpenProfile={() => router.push('/profile')}
    />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 92 },
  header: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  headerCopy: { flex: 1, gap: Spacing.two },
  title: { color: '#1E293B', fontSize: 34, lineHeight: 40 },
  subtitle: { maxWidth: 250, lineHeight: 19 },
  headerImage: { width: 150, height: 112, marginRight: -10 },
  nextCard: { borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.three, gap: Spacing.three, ...Shadow.soft },
  sectionTitle: { color: '#1E293B' },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nextProgressBlock: { flex: 1, gap: Spacing.two },
  nextTitle: { color: '#1E293B', fontSize: 16 },
  progressBar: { height: 12, borderRadius: 6, backgroundColor: '#EAF5FF', overflow: 'hidden' },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: '#3B82F6' },
  nextNumbers: { color: '#64748B' },
  badgesHeader: { gap: Spacing.two },
  badgesTitle: { color: '#1E293B', fontSize: 18 },
  filterRow: { flexDirection: 'row', gap: Spacing.one, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#EAF5FF', backgroundColor: '#FFFFFF', padding: Spacing.one },
  filterPill: { flex: 1, minHeight: 34, borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: '#3B82F6' },
  filterText: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badgeCard: { width: '48.7%', minHeight: 112, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, overflow: 'hidden', ...Shadow.soft },
  lockedCard: { opacity: 0.78, backgroundColor: '#F8FBFF' },
  badgeAccentRail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  badgeIconShell: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgeImage: { width: 54, height: 54 },
  badgeCopy: { flex: 1, gap: Spacing.one },
  badgeTitle: { color: '#1E293B', fontSize: 13, lineHeight: 16 },
  badgeCategoryPill: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: 3 },
  badgeCategory: { fontSize: 10, fontWeight: '800' },
  statusChip: { position: 'absolute', right: Spacing.two, top: Spacing.two, minHeight: 20, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.two },
  statusUnlocked: { backgroundColor: '#22C55E' },
  statusLocked: { backgroundColor: '#EAF5FF' },
  statusText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  statusTextLocked: { color: '#64748B' },
  numberBadge: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5FF', borderWidth: 2, borderColor: '#22C55E' },
  numberBadgeLocked: { backgroundColor: '#EAF5FF', borderColor: '#64748B' },
  numberBadgeText: { color: '#22C55E', fontSize: 17, fontWeight: '900', lineHeight: 19 },
  numberBadgeSub: { color: '#22C55E', fontSize: 8, fontWeight: '900' },
  numberBadgeTextLocked: { color: '#64748B' },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  error: { color: '#DC2626', textAlign: 'center' },
  pressed: { opacity: 0.75 },
});
