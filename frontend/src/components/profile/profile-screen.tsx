import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabs } from '@/components/navigation/bottom-tabs';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { getProgress, type ProgressMilestone, type UserProgress } from '@/lib/progress-api';
import { getQuitProfile, type QuitProfile } from '@/lib/quit-profile-api';
import { sessionStore } from '@/lib/session-store';

const avatarImage = require('@/assets/drop-the-vape/dashboard/call_pC6LGKdabUMWxsSBYWFaOye1.png');
const achievementIcons = [
  require('@/assets/drop-the-vape/dashboard/1.png'),
  require('@/assets/drop-the-vape/dashboard/2.png'),
  require('@/assets/drop-the-vape/dashboard/3.png'),
  require('@/assets/drop-the-vape/dashboard/4.png'),
];

const fallbackAchievements: ProgressMilestone[] = [
  { key: 'first_day', label: 'First Day', description: 'Earned', unlocked: true },
  { key: 'one_week', label: 'First Week', description: 'Earned', unlocked: true },
  { key: 'healthy_heart', label: 'Healthy Heart', description: 'Earned', unlocked: true },
  { key: 'one_month', label: '30 Days', description: 'Locked', unlocked: false },
];

const achievementIconByKey: Record<string, number> = {
  first_day: achievementIcons[0],
  one_week: achievementIcons[1],
  streak_7: achievementIcons[1],
  two_weeks: achievementIcons[2],
  healthy_heart: achievementIcons[2],
  one_month: achievementIcons[3],
  strong_start: achievementIcons[2],
  getting_better: achievementIcons[3],
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function formatDate(value?: string) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function quitGoalLabel(value?: string) {
  if (value === '7_days') {
    return '7 Days Vape-Free';
  }

  if (value === '30_days') {
    return '30 Days Vape-Free';
  }

  if (value === 'save_100') {
    return 'Save $100';
  }

  return 'Quit Completely';
}

function achievementsFor(progress: UserProgress) {
  const source = progress.milestones.length ? progress.milestones : fallbackAchievements;
  return source.slice(0, 4);
}

type ProfileContentProps = {
  progress: UserProgress;
  quitProfile: QuitProfile;
  error?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onOpenHome: () => void;
  onOpenProgress: () => void;
  onOpenPremium: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

function ProfileContent({
  progress,
  quitProfile,
  error,
  isRefreshing,
  onRefresh,
  onRetry,
  onOpenHome,
  onOpenProgress,
  onOpenPremium,
  onOpenAchievements,
  onOpenProfile,
  onOpenSettings,
  onLogout,
}: ProfileContentProps) {
  const achievements = achievementsFor(progress);

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.topBar}>
          <ThemedText type="headline" style={styles.title}>Profile</ThemedText>
          <Pressable onPress={onOpenSettings} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
            <SymbolView name={'gearshape' as any} size={18} tintColor="#64748B" fallback={<ThemedText style={styles.settingsIcon}>*</ThemedText>} />
            <ThemedText type="smallBold" style={styles.settingsText}>Settings</ThemedText>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.cloudLarge} />
          <View style={styles.cloudSmall} />
          <View style={styles.vapeOutline} />
          <View style={styles.heroHeader}>
            <View style={styles.avatarWrap}>
              <Image source={avatarImage} style={styles.avatarImage} contentFit="cover" />
              <View style={styles.cameraBadge}><ThemedText style={styles.cameraIcon}>o</ThemedText></View>
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="headline" style={styles.greeting}>Hi, Alex!</ThemedText>
              <ThemedText type="small" style={styles.memberText}>Member since {formatDate(quitProfile.setupCompletedAt)}</ThemedText>
            </View>
          </View>
          <View style={styles.heroStats}>
            <HeroStat icon="F" value={`${progress.currentStreak}`} label="Day Streak" />
            <HeroStat icon="H" value={`${Math.max(0, progress.goal.percent)}%`} label="Health Recovery" />
            <HeroStat icon="T" value={`${achievements.filter((item) => item.unlocked).length}`} label="Badges Earned" />
          </View>
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.errorText}>{error}</ThemedText><Button label="Try again" onPress={onRetry} /></View> : null}

        <Section title="Journey Summary" action="View Details" onAction={onOpenProgress}>
          <View style={styles.summaryGrid}>
            <SummaryMetric icon="$" label="Money Saved" value={formatMoney(progress.moneySaved)} color="#22C55E" />
            <SummaryMetric icon="P" label="Puffs Avoided" value={formatNumber(progress.vapesAvoided)} color="#3B82F6" />
            <SummaryMetric icon="O" label="Time Vape-Free" value={`${progress.daysVapeFree} Days`} color="#3B82F6" />
            <SummaryMetric icon="G" label="Current Goal" value={quitGoalLabel(quitProfile.quitGoal)} color="#22C55E" />
          </View>
        </Section>

        <Section title="My Plan">
          <View style={styles.rowsCard}>
            <InfoRow icon="G" label="Quit Goal" value={quitGoalLabel(quitProfile.quitGoal)} color="#3B82F6" />
            <InfoRow icon="D" label="Quit Date" value={formatDate(quitProfile.quitStartDate)} color="#3B82F6" />
            <InfoRow icon="R" label="Daily Reminder" value="8:00 PM" color="#22C55E" />
            <InfoRow icon="M" label="Motivation Style" value="Encouraging" color="#22C55E" />
          </View>
        </Section>

        <Section title="Latest Achievements" action="View All Achievements" onAction={onOpenAchievements}>
          <View style={styles.achievementRow}>
            {achievements.map((item, index) => (
              <AchievementTile key={`${item.key}-${index}`} item={item} index={index} />
            ))}
          </View>
        </Section>

        <View style={styles.groupGrid}>
          <MenuGroup title="Preferences" items={[
            { icon: 'bell', fallback: 'B', label: 'Notifications' },
            { icon: 'moon', fallback: 'M', label: 'Appearance' },
            { icon: 'globe', fallback: 'G', label: 'Language' },
            { icon: 'chart.bar', fallback: 'C', label: 'Units & Statistics' },
          ]} />
          <MenuGroup title="Support" items={[
            { icon: 'questionmark.circle', fallback: '?', label: 'Help Center' },
            { icon: 'message', fallback: 'C', label: 'Contact Support' },
            { icon: 'star', fallback: '*', label: 'Rate the App' },
            { icon: 'square.and.arrow.up', fallback: '^', label: 'Share with Friends' },
          ]} />
          <MenuGroup title="Account" items={[
            { icon: 'person', fallback: 'P', label: 'Edit Profile' },
            { icon: 'lock', fallback: 'L', label: 'Change Password' },
            { icon: 'shield', fallback: 'S', label: 'Privacy Policy' },
            { icon: 'doc.text', fallback: 'D', label: 'Terms of Service' },
            { icon: 'trash', fallback: 'X', label: 'Delete Account' },
            { icon: 'rectangle.portrait.and.arrow.right', fallback: '>', label: 'Log Out', danger: true, onPress: onLogout },
          ]} />
        </View>
      </ScrollView>
      <BottomTabs active="profile" variant="floating" onOpenHome={onOpenHome} onOpenProgress={onOpenProgress} onOpenPremium={onOpenPremium} onOpenAchievements={onOpenAchievements} onOpenRightTab={onOpenProfile} />
    </Screen>
  );
}

function HeroStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}><ThemedText style={styles.heroStatGlyph}>{icon}</ThemedText></View>
      <View>
        <ThemedText type="headline" style={styles.heroStatValue}>{value}</ThemedText>
        <ThemedText type="small" style={styles.heroStatLabel}>{label}</ThemedText>
      </View>
    </View>
  );
}

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>{title}</ThemedText>
        {action ? (
          <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" style={styles.linkText}>{action} &gt;</ThemedText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function SummaryMetric({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryMetric}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}><ThemedText style={[styles.summaryIconText, { color }]}>{icon}</ThemedText></View>
      <ThemedText type="small" style={styles.summaryLabel}>{label}</ThemedText>
      <ThemedText type="smallBold" style={[styles.summaryValue, { color }]} numberOfLines={2}>{value}</ThemedText>
    </View>
  );
}

function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}16` }]}><ThemedText style={[styles.rowIconText, { color }]}>{icon}</ThemedText></View>
      <ThemedText type="smallBold" style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText type="small" style={styles.rowValue} numberOfLines={1}>{value}</ThemedText>
      <ThemedText style={styles.chevron}>&gt;</ThemedText>
    </Pressable>
  );
}

function AchievementTile({ item, index }: { item: ProgressMilestone; index: number }) {
  const colors = ['#22C55E', '#22C55E', '#DC2626', '#64748B'];
  const color = item.unlocked ? colors[index % colors.length] : '#64748B';
  const icon = achievementIconByKey[item.key] ?? achievementIcons[index % achievementIcons.length];

  return (
    <View style={styles.achievementTile}>
      <View style={[styles.achievementIconWrap, { backgroundColor: item.unlocked ? `${color}24` : '#EAF5FF' }]}>
        <Image source={icon} style={[styles.achievementImage, !item.unlocked && styles.lockedImage]} contentFit="contain" />
      </View>
      <ThemedText type="smallBold" style={styles.achievementLabel} numberOfLines={2}>{item.label}</ThemedText>
      <ThemedText type="small" style={styles.achievementState}>{item.unlocked ? 'Earned' : 'Locked'}</ThemedText>
    </View>
  );
}

type MenuItem = {
  icon: string;
  fallback: string;
  label: string;
  danger?: boolean;
  onPress?: () => void;
};

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.menuGroup}>
      <ThemedText type="smallBold" style={styles.menuTitle}>{title}</ThemedText>
      {items.map((item) => (
        <Pressable key={item.label} onPress={item.onPress} style={({ pressed }) => [styles.menuItem, item.danger && styles.dangerItem, pressed && styles.pressed]}>
          <View style={styles.menuIconWrap}>
            <SymbolView name={item.icon as any} size={15} tintColor={item.danger ? '#DC2626' : '#64748B'} fallback={<ThemedText style={[styles.menuIconFallback, item.danger && styles.dangerText]}>{item.fallback}</ThemedText>} />
          </View>
          <ThemedText type="small" style={[styles.menuLabel, item.danger && styles.dangerText]} numberOfLines={1}>{item.label}</ThemedText>
          {!item.danger ? <ThemedText style={styles.menuChevron}>&gt;</ThemedText> : null}
        </Pressable>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [quitProfile, setQuitProfile] = useState<QuitProfile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    const token = sessionStore.getToken();
    if (!token) {
      router.replace('/welcome');
      return;
    }

    mode === 'refresh' ? setIsRefreshing(true) : setIsLoading(true);
    setError('');

    try {
      const [progressResult, profileResult] = await Promise.all([getProgress(token), getQuitProfile(token)]);
      setProgress(progressResult.progress);
      setQuitProfile(profileResult.quitProfile);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load your profile.';
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
    loadProfile();
  }, [loadProfile]);

  const logout = useCallback(() => {
    sessionStore.clearToken();
    router.replace('/welcome');
  }, [router]);

  if (isLoading && (!progress || !quitProfile)) {
    return (
      <Screen centered>
        <ThemedText type="headline" style={{ textAlign: 'center' }}>Loading your profile...</ThemedText>
      </Screen>
    );
  }

  if (!progress || !quitProfile) {
    return (
      <Screen centered>
        <ThemedText type="headline" style={{ textAlign: 'center' }}>{error || 'Unable to load your profile.'}</ThemedText>
        <Button label="Try again" onPress={() => loadProfile()} />
      </Screen>
    );
  }

  return (
    <ProfileContent
      progress={progress}
      quitProfile={quitProfile}
      error={error}
      isRefreshing={isRefreshing}
      onRefresh={() => loadProfile('refresh')}
      onRetry={() => loadProfile()}
      onOpenHome={() => router.push('/home')}
      onOpenProgress={() => router.push('/progress')}
      onOpenPremium={() => router.push('/premium')}
      onOpenAchievements={() => router.push('/achievements')}
      onOpenProfile={() => router.push('/profile')}
      onOpenSettings={() => router.push('/settings')}
      onLogout={logout}
    />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 96 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#1E293B', fontSize: 28, lineHeight: 34 },
  settingsButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingHorizontal: Spacing.two },
  settingsIcon: { color: '#64748B', fontSize: 20, lineHeight: 22, fontWeight: '900' },
  settingsText: { color: '#64748B', fontSize: 12 },
  heroCard: { minHeight: 158, borderRadius: Radius.large, backgroundColor: '#EAF5FF', padding: Spacing.three, gap: Spacing.three, overflow: 'hidden', ...Shadow.soft },
  cloudLarge: { position: 'absolute', right: 40, top: 52, width: 74, height: 28, borderRadius: 16, backgroundColor: '#FFFFFF', opacity: 0.75 },
  cloudSmall: { position: 'absolute', right: 18, top: 84, width: 54, height: 20, borderRadius: 12, backgroundColor: '#FFFFFF', opacity: 0.42 },
  vapeOutline: { position: 'absolute', right: 24, top: 30, width: 18, height: 80, borderWidth: 4, borderColor: '#3B82F6', borderRadius: 7, transform: [{ rotate: '26deg' }], opacity: 0.72 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatarWrap: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#EAF5FF', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 70, height: 70, borderRadius: 35 },
  cameraBadge: { position: 'absolute', right: -2, bottom: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { color: '#FFFFFF', fontSize: 11, lineHeight: 13, fontWeight: '900' },
  heroCopy: { flex: 1 },
  greeting: { color: '#1E293B', fontSize: 22, lineHeight: 28 },
  memberText: { color: '#64748B', fontSize: 12 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  heroStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  heroStatIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  heroStatGlyph: { color: '#22C55E', fontSize: 15, lineHeight: 18, fontWeight: '900' },
  heroStatValue: { color: '#1E293B', fontSize: 18, lineHeight: 22 },
  heroStatLabel: { color: '#64748B', fontSize: 10, lineHeight: 12 },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  errorText: { color: '#DC2626', textAlign: 'center' },
  section: { borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.three, gap: Spacing.three, ...Shadow.soft },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  sectionTitle: { color: '#1E293B', fontSize: 13 },
  linkText: { color: '#3B82F6', fontSize: 11 },
  summaryGrid: { flexDirection: 'row' },
  summaryMetric: { flex: 1, alignItems: 'center', gap: Spacing.one, minHeight: 86, borderRightWidth: 1, borderColor: '#EAF5FF', paddingHorizontal: Spacing.one },
  summaryIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { fontSize: 17, fontWeight: '800' },
  summaryLabel: { color: '#64748B', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  summaryValue: { fontSize: 13, lineHeight: 16, textAlign: 'center' },
  rowsCard: { borderWidth: 1, borderColor: '#EAF5FF', borderRadius: Radius.medium, overflow: 'hidden' },
  infoRow: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.two, borderBottomWidth: 1, borderBottomColor: '#EAF5FF' },
  rowIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowIconText: { fontSize: 14, fontWeight: '900' },
  rowLabel: { flex: 1, color: '#1E293B', fontSize: 11 },
  rowValue: { maxWidth: 132, color: '#64748B', fontSize: 11, textAlign: 'right' },
  chevron: { color: '#64748B', fontSize: 14, lineHeight: 18, fontWeight: '900' },
  achievementRow: { flexDirection: 'row', gap: Spacing.two },
  achievementTile: { flex: 1, alignItems: 'center', gap: Spacing.one, minHeight: 88 },
  achievementIconWrap: { width: 55, height: 55, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  achievementImage: { width: 48, height: 48 },
  lockedImage: { opacity: 0.45 },
  achievementLabel: { color: '#1E293B', fontSize: 10, lineHeight: 12, textAlign: 'center' },
  achievementState: { color: '#64748B', fontSize: 9, lineHeight: 11 },
  groupGrid: { flexDirection: 'row', gap: Spacing.two },
  menuGroup: { flex: 1, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', padding: Spacing.two, gap: Spacing.one, ...Shadow.soft },
  menuTitle: { color: '#1E293B', fontSize: 11, marginBottom: Spacing.one },
  menuItem: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderRadius: Radius.small, paddingHorizontal: Spacing.one },
  menuIconWrap: { width: 16, height: 18, alignItems: 'center', justifyContent: 'center' },
  menuIconFallback: { color: '#64748B', fontSize: 13, textAlign: 'center', fontWeight: '800' },
  menuLabel: { flex: 1, color: '#1E293B', fontSize: 10 },
  menuChevron: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  dangerItem: { backgroundColor: '#FEF2F2' },
  dangerText: { color: '#DC2626' },
  pressed: { opacity: 0.75 },
});
