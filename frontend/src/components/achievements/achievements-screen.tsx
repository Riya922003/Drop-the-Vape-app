import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
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

function bestUnlockedBadge(badges: ProgressMilestone[]) {
  const unlocked = badges.filter((badge) => badge.unlocked);
  return unlocked[unlocked.length - 1] ?? badges[0];
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
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
}) {
  const badges = progress.milestones.length ? progress.milestones : fallbackMilestones;
  const current = bestUnlockedBadge(badges);
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

        <View style={styles.currentCard}>
          <View style={styles.currentBadgeFrame}>
            <Image source={imageByKey[current.key] ?? badgeImages.gold} style={styles.currentBadgeImage} contentFit="contain" />
            <View style={styles.ribbon}><ThemedText type="smallBold" style={styles.ribbonText}>{targetForBadge(current)} DAYS</ThemedText></View>
          </View>
          <View style={styles.currentCopy}>
            <ThemedText type="smallBold" style={styles.currentMeta}>Current Milestone</ThemedText>
            <ThemedText type="headline" style={styles.currentTitle}>{current.label} Vape-Free</ThemedText>
            <ThemedText type="small" style={styles.currentBody}>{current.unlocked ? 'Congratulations! You have unlocked this milestone.' : 'Keep going to unlock this milestone.'}</ThemedText>
            <Pressable style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}><ThemedText type="smallBold" style={styles.shareText}>Share Achievement</ThemedText></Pressable>
          </View>
        </View>

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
            {['All', 'Streak', 'Health', 'Savings', 'Goals'].map((item, index) => <View key={item} style={[styles.filterPill, index === 0 && styles.filterActive]}><ThemedText style={[styles.filterText, index === 0 && styles.filterTextActive]}>{item}</ThemedText></View>)}
          </View>
        </View>

        <View style={styles.badgeGrid}>{badges.map((badge) => <BadgeCard key={badge.key} badge={badge} />)}</View>
      </ScrollView>

      <View style={styles.bottomTabs}>
        <TabButton label="Home" icon="H" onPress={onOpenHome} />
        <TabButton label="Progress" icon="P" onPress={onOpenProgress} />
        <TabButton label="Achievements" icon="A" active onPress={onOpenAchievements} />
        <TabButton label="Profile" icon="M" onPress={onOpenProfile} />
      </View>
    </Screen>
  );
}

function BadgeCard({ badge }: { badge: ProgressMilestone }) {
  return (
    <View style={[styles.badgeCard, !badge.unlocked && styles.lockedCard]}>
      {imageByKey[badge.key] && badge.unlocked ? <Image source={imageByKey[badge.key]} style={styles.badgeImage} contentFit="contain" /> : <NumberBadge badge={badge} locked={!badge.unlocked} />}
      <View style={styles.badgeCopy}>
        <ThemedText type="smallBold" style={styles.badgeTitle}>{badge.label}</ThemedText>
        <ThemedText style={styles.badgeCategory}>{badgeCategory(badge)}</ThemedText>
      </View>
      <View style={[styles.statusDot, badge.unlocked ? styles.statusUnlocked : styles.statusLocked]}><ThemedText style={styles.statusText}>{badge.unlocked ? 'Y' : 'L'}</ThemedText></View>
    </View>
  );
}

function NumberBadge({ badge, locked }: { badge: ProgressMilestone; locked?: boolean }) {
  return <View style={[styles.numberBadge, locked && styles.numberBadgeLocked]}><ThemedText style={[styles.numberBadgeText, locked && styles.numberBadgeTextLocked]}>{lockedDayLabel(badge)}</ThemedText><ThemedText style={[styles.numberBadgeSub, locked && styles.numberBadgeTextLocked]}>{targetForBadge(badge) >= 365 ? 'YEAR' : 'DAYS'}</ThemedText></View>;
}

function TabButton({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <ThemedText style={[styles.tabIcon, active && styles.tabActive]}>{icon}</ThemedText>
      <ThemedText style={[styles.tabLabel, active && styles.tabActive]}>{label}</ThemedText>
    </Pressable>
  );
}

export function AchievementsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
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
      onOpenAchievements={() => router.push('/achievements')}
      onOpenProfile={() => router.push('/profile')}
    />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FBFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 92 },
  header: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  headerCopy: { flex: 1, gap: Spacing.two },
  title: { color: '#071B44', fontSize: 34, lineHeight: 40 },
  subtitle: { maxWidth: 250, lineHeight: 19 },
  headerImage: { width: 150, height: 112, marginRight: -10 },
  currentCard: { minHeight: 150, borderRadius: Radius.large, backgroundColor: '#082863', flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, overflow: 'hidden', ...Shadow.soft },
  currentBadgeFrame: { width: 135, alignItems: 'center', justifyContent: 'center' },
  currentBadgeImage: { width: 118, height: 118 },
  ribbon: { position: 'absolute', bottom: 12, borderRadius: Radius.small, backgroundColor: '#2F80ED', paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  ribbonText: { color: '#FFFFFF', fontSize: 13 },
  currentCopy: { flex: 1, justifyContent: 'center', gap: Spacing.two },
  currentMeta: { color: '#78B2FF', fontSize: 12 },
  currentTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 27 },
  currentBody: { color: '#DCEBFF', lineHeight: 17 },
  shareButton: { minHeight: 38, borderRadius: Radius.small, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three, alignSelf: 'flex-start' },
  shareText: { color: '#1685FF' },
  nextCard: { borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.three, gap: Spacing.three, ...Shadow.soft },
  sectionTitle: { color: '#071B44' },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nextProgressBlock: { flex: 1, gap: Spacing.two },
  nextTitle: { color: '#071B44', fontSize: 16 },
  progressBar: { height: 12, borderRadius: 6, backgroundColor: '#DDE6F2', overflow: 'hidden' },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: '#2F80ED' },
  nextNumbers: { color: '#5070A7' },
  badgesHeader: { gap: Spacing.two },
  badgesTitle: { color: '#071B44', fontSize: 18 },
  filterRow: { flexDirection: 'row', gap: Spacing.one, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#D8E5F5', backgroundColor: '#FFFFFF', padding: Spacing.one },
  filterPill: { flex: 1, minHeight: 34, borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: '#1685FF' },
  filterText: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badgeCard: { width: '48.7%', minHeight: 82, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1ECF8', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, ...Shadow.soft },
  lockedCard: { opacity: 0.72 },
  badgeImage: { width: 54, height: 54 },
  badgeCopy: { flex: 1 },
  badgeTitle: { color: '#071B44', fontSize: 13 },
  badgeCategory: { color: '#64748B', fontSize: 11 },
  statusDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statusUnlocked: { backgroundColor: '#36B66D' },
  statusLocked: { backgroundColor: '#E2E8F0' },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  numberBadge: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE7B8', borderWidth: 2, borderColor: '#F7B733' },
  numberBadgeLocked: { backgroundColor: '#E5E7EB', borderColor: '#B8C1CF' },
  numberBadgeText: { color: '#D97706', fontSize: 17, fontWeight: '900', lineHeight: 19 },
  numberBadgeSub: { color: '#D97706', fontSize: 8, fontWeight: '900' },
  numberBadgeTextLocked: { color: '#7B8798' },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  error: { color: '#DC2626', textAlign: 'center' },
  bottomTabs: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 72, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#DCEBFA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabButton: { alignItems: 'center', justifyContent: 'center', gap: Spacing.one, minWidth: 70 },
  tabIcon: { color: '#8B98AF', fontSize: 20 },
  tabLabel: { color: '#8B98AF', fontSize: 10 },
  tabActive: { color: '#1685FF', fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
