import { Image } from 'expo-image';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabs } from '@/components/navigation/bottom-tabs';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import type { ProgressMilestone, UserProgress } from '@/lib/progress-api';

const dashboardIcons = [
  require('@/assets/drop-the-vape/dashboard/call_0nUBhHh5Fm1ZJY3inT79EfyP.png'),
  require('@/assets/drop-the-vape/dashboard/call_cSJUaMaBKcEvUTbybpZKyaJH.png'),
  require('@/assets/drop-the-vape/dashboard/call_cX7i9xzO5rEgb9Ca2lxtdFOC.png'),
  require('@/assets/drop-the-vape/dashboard/call_kCIHs9QqazyaNnIgWOPiLcXi.png'),
  require('@/assets/drop-the-vape/dashboard/call_nE5KQJ1NfRMmU1aeoIKxVT2c.png'),
  require('@/assets/drop-the-vape/dashboard/call_pC6LGKdabUMWxsSBYWFaOye1.png'),
];

const dashboardCardImages = {
  motivation: require('@/assets/drop-the-vape/dashboard/11 (1).png'),
  support: require('@/assets/drop-the-vape/dashboard/11 (3).png'),
};

const achievementIcons = [
  require('@/assets/drop-the-vape/dashboard/1.png'),
  require('@/assets/drop-the-vape/dashboard/2.png'),
  require('@/assets/drop-the-vape/dashboard/3.png'),
  require('@/assets/drop-the-vape/dashboard/4.png'),
];

const healthTimelineRules = [
  { image: dashboardIcons[0], title: '20 mins', description: 'Heart rate normalizes', thresholdDays: 0, color: '#22C55E' },
  { image: dashboardIcons[1], title: '2-12 weeks', description: 'Better lung function', thresholdDays: 14, color: '#3B82F6' },
  { image: dashboardIcons[2], title: '3-9 months', description: 'Better stamina & energy', thresholdDays: 90, color: '#64748B' },
  { image: dashboardIcons[3], title: '1-5 years', description: 'Health risks drop down', thresholdDays: 365, color: '#64748B' },
];

const fallbackAchievements: ProgressMilestone[] = [
  { key: 'one_week', label: 'One Week', description: '7 days vape-free', unlocked: false },
  { key: 'streak_7', label: 'Consistency', description: '7 day streak', unlocked: false },
  { key: 'two_weeks', label: 'Strong Start', description: 'First 10 days', unlocked: false },
  { key: 'one_month', label: 'Getting Better', description: '2 weeks vape-free', unlocked: false },
];

const achievementIconByKey: Record<string, number> = {
  first_day: achievementIcons[0],
  one_week: achievementIcons[0],
  streak_7: achievementIcons[1],
  two_weeks: achievementIcons[2],
  one_month: achievementIcons[3],
  strong_start: achievementIcons[2],
  getting_better: achievementIcons[3],
  saved_100: achievementIcons[3],
  avoided_100: achievementIcons[2],
};

type HomeDashboardProps = {
  progress: UserProgress;
  userName: string;
  error?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenHome: () => void;
  onOpenProgress: () => void;
  onOpenPremium: () => void;
  onOpenSupport?: () => void;
};

function formatMoney(value: number) {
  return `Rs ${Math.round(value).toLocaleString()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function dashboardAchievements(progress: UserProgress) {
  const preferredKeys = ['one_week', 'streak_7', 'two_weeks', 'one_month'];
  const milestones = progress.milestones.length ? progress.milestones : fallbackAchievements;
  return preferredKeys.map((key) => milestones.find((item) => item.key === key)).filter(Boolean) as ProgressMilestone[];
}

export function HomeDashboard({ progress, userName, error, isRefreshing, onRefresh, onRetry, onOpenAchievements, onOpenProfile, onOpenHome, onOpenProgress, onOpenPremium, onOpenSupport }: HomeDashboardProps) {
  const achievements = dashboardAchievements(progress);
  const timeline = healthTimelineRules.map((item) => ({ ...item, active: progress.daysVapeFree >= item.thresholdDays }));
  const firstName = userName.trim().split(/\s+/)[0] || 'there';

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/drop-the-vape/logo.png')} style={styles.brandLogo} contentFit="contain" />
            <ThemedText type="smallBold" style={styles.brandText}>Drop Vape</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><ThemedText style={styles.headerIcon}>!</ThemedText></Pressable>
            <Pressable onPress={onOpenProfile} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}><Image source={dashboardIcons[5]} style={styles.avatarImage} contentFit="cover" /></Pressable>
          </View>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.greetingBlock}>
            <ThemedText type="headline" style={styles.greeting}>Good morning,{`\n`}{firstName}!</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">You're doing great. Keep going!</ThemedText>
          </View>
          <View style={styles.streakCard}>
            <Image source={dashboardIcons[4]} style={styles.streakIconImage} contentFit="contain" />
            <ThemedText type="headline" style={styles.streakNumber}>{progress.currentStreak}</ThemedText>
            <ThemedText type="smallBold" style={styles.streakLabel}>Breath Streak</ThemedText>
            <ThemedText type="small" style={styles.streakSub}>Complete daily</ThemedText>
          </View>
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.error}>{error}</ThemedText><Button label="Try again" onPress={onRetry} /></View> : null}

        <View style={styles.statsRow}>
          <MetricCard image={dashboardIcons[0]} label="Money Saved" value={formatMoney(progress.moneySaved)} subLabel="Total saved" color="#22C55E" />
          <MetricCard image={dashboardIcons[1]} label="Time Vape-Free" value={`${progress.daysVapeFree} Days`} subLabel={progress.quitStartDate ? `Since ${formatDate(progress.quitStartDate)}` : 'Since your quit date'} color="#3B82F6" />
        </View>

        <SectionCard>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Your Health is Improving</ThemedText>
            <Pressable onPress={onOpenProgress} style={({ pressed }) => pressed && styles.pressed}><ThemedText type="smallBold" style={styles.linkText}>See Timeline -&gt;</ThemedText></Pressable>
          </View>
          <View style={styles.timelineTrack}>
            <View style={styles.timelineLine} />
            {timeline.map((item) => <TimelineItem key={item.title} {...item} />)}
          </View>
        </SectionCard>

        <SectionCard>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Achievements</ThemedText>
            <Pressable onPress={onOpenAchievements} style={({ pressed }) => pressed && styles.pressed}><ThemedText type="smallBold" style={styles.linkText}>View All</ThemedText></Pressable>
          </View>
          <View style={styles.achievementRow}>{achievements.map((item, index) => <AchievementTile key={`${item.key}-${index}`} item={item} index={index} />)}</View>
          <View style={styles.dots}><View style={styles.dotActive} /><View style={styles.dot} /><View style={styles.dot} /></View>
        </SectionCard>

        <View style={styles.smallCardsRow}>
          <InfoCard title="Daily Motivation" body="The best time to quit was yesterday. The next best time is now." accent="#3B82F6" image={dashboardCardImages.motivation} />
          <InfoCard title="Craving Support" body="Use a breath hold check to move through the moment." accent="#22C55E" image={dashboardCardImages.support} action="-&gt;" onPress={onOpenSupport} />
        </View>
      </ScrollView>
      <BottomTabs active="home" variant="floating" onOpenHome={onOpenHome} onOpenProgress={onOpenProgress} onOpenPremium={onOpenPremium} onOpenAchievements={onOpenAchievements} onOpenRightTab={onOpenProfile} />
    </Screen>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function MetricCard({ image, label, value, subLabel, color }: { image: number; label: string; value: string; subLabel: string; color: string }) {
  return <View style={styles.metricCard}><View style={[styles.metricIcon, { backgroundColor: `${color}1A` }]}><Image source={image} style={styles.metricImage} contentFit="contain" /></View><View style={styles.metricCopy}><ThemedText type="smallBold" style={styles.metricLabel}>{label}</ThemedText><ThemedText type="headline" style={[styles.metricValue, { color }]}>{value}</ThemedText><ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>{subLabel}</ThemedText></View></View>;
}

function TimelineItem({ image, title, description, active, color }: { image: number; title: string; description: string; active?: boolean; color: string }) {
  return <View style={styles.timelineItem}><View style={[styles.timelineIcon, active && styles.timelineIconActive, { borderColor: active ? color : '#EAF5FF' }]}>{active ? <View style={[styles.activeDot, { backgroundColor: color }]} /> : null}<Image source={image} style={styles.timelineImage} contentFit="contain" /></View><ThemedText type="smallBold" style={styles.timelineTitle}>{title}</ThemedText><ThemedText type="small" style={styles.timelineDescription}>{description}</ThemedText></View>;
}

function AchievementTile({ item, index }: { item: ProgressMilestone; index: number }) {
  const colors = ['#22C55E', '#3B82F6', '#3B82F6', '#22C55E'];
  const color = item.unlocked ? colors[index % colors.length] : '#64748B';
  const icon = achievementIconByKey[item.key] ?? achievementIcons[index % achievementIcons.length];
  return <View style={[styles.achievementTile, !item.unlocked && styles.achievementTileLocked]}><View style={[styles.badgeShape, { borderColor: color, backgroundColor: item.unlocked ? `${color}22` : '#EAF5FF' }]}><Image source={icon} style={[styles.badgeImage, !item.unlocked && styles.badgeImageLocked]} contentFit="contain" /></View><ThemedText type="smallBold" style={styles.achievementTitle}>{item.label}</ThemedText><ThemedText type="small" themeColor="textSecondary" style={styles.achievementDescription}>{item.description}</ThemedText></View>;
}

function InfoCard({ title, body, accent, image, action, onPress }: { title: string; body: string; accent: string; image: number; action?: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}><ThemedText type="smallBold" style={[styles.infoTitle, { color: accent }]}>{title}</ThemedText><ThemedText type="small" themeColor="textSecondary" style={styles.infoBody}>{body}</ThemedText><Image source={image} style={styles.infoImage} contentFit="contain" />{action ? <ThemedText type="headline" style={[styles.infoAction, { color: accent }]}>{action}</ThemedText> : null}</Pressable>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 104 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  brandLogo: { width: 36, height: 36 },
  brandText: { color: '#1E293B', fontSize: 17 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  iconButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: '#1E293B', fontSize: 20, fontWeight: '800' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5FF', overflow: 'hidden' },
  avatarImage: { width: 42, height: 42 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greetingBlock: { flex: 1, gap: Spacing.one },
  greeting: { color: '#1E293B', fontSize: 27, lineHeight: 32 },
  streakCard: { width: 118, minHeight: 94, borderRadius: Radius.large, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: Spacing.half, ...Shadow.soft },
  streakIconImage: { position: 'absolute', left: 14, top: 10, width: 28, height: 28 },
  streakNumber: { color: '#3B82F6', fontSize: 24, lineHeight: 28, textAlign: 'center' },
  streakLabel: { color: '#1E293B', fontSize: 12, textAlign: 'center' },
  streakSub: { color: '#22C55E', fontSize: 11, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  metricCard: { flex: 1, minHeight: 86, borderRadius: Radius.large, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, ...Shadow.soft },
  metricIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  metricImage: { width: 38, height: 38 },
  metricCopy: { flex: 1 },
  metricLabel: { color: '#1E293B', fontSize: 11, lineHeight: 15 },
  metricValue: { fontSize: 21, lineHeight: 25 },
  metricSub: { fontSize: 10, lineHeight: 14 },
  sectionCard: { borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.three, gap: Spacing.three, ...Shadow.soft },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  sectionTitle: { color: '#1E293B', fontSize: 14 },
  linkText: { color: '#3B82F6', fontSize: 12 },
  timelineTrack: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative', paddingTop: Spacing.one },
  timelineLine: { position: 'absolute', left: 38, right: 38, top: 24, height: 3, backgroundColor: '#EAF5FF' },
  timelineItem: { width: '24%', alignItems: 'center', gap: Spacing.one },
  timelineIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF5FF', borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  timelineIconActive: { backgroundColor: '#EAF5FF' },
  activeDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, left: 4, top: 4, zIndex: 1 },
  timelineImage: { width: 34, height: 34 },
  timelineTitle: { color: '#1E293B', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  timelineDescription: { color: '#64748B', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  achievementRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  achievementTile: { flex: 1, alignItems: 'center', gap: Spacing.one },
  badgeShape: { width: 52, height: 52, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badgeImage: { width: 42, height: 42 },
  achievementTitle: { color: '#1E293B', fontSize: 10, lineHeight: 13, textAlign: 'center' },
  achievementDescription: { fontSize: 9, lineHeight: 12, textAlign: 'center' },
  achievementTileLocked: { opacity: 0.55 },
  badgeImageLocked: { opacity: 0.45 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.one },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#EAF5FF' },
  dotActive: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3B82F6' },
  smallCardsRow: { flexDirection: 'row', gap: Spacing.two },
  infoCard: { flex: 1, minHeight: 108, borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.two, gap: Spacing.one, overflow: 'hidden', ...Shadow.soft },
  infoTitle: { fontSize: 12 },
  infoBody: { fontSize: 10, lineHeight: 14, maxWidth: '72%' },
  infoImage: { position: 'absolute', right: 0, bottom: 0, width: 66, height: 66, opacity: 0.9 },
  infoAction: { position: 'absolute', right: 14, bottom: 28 },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  error: { color: '#DC2626', textAlign: 'center' },
  pressed: { opacity: 0.75 },
});
