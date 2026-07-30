import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

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

const achievementIcons = [
  require('@/assets/drop-the-vape/dashboard/1.png'),
  require('@/assets/drop-the-vape/dashboard/2.png'),
  require('@/assets/drop-the-vape/dashboard/3.png'),
  require('@/assets/drop-the-vape/dashboard/4.png'),
];

const mountainImage = require('@/assets/drop-the-vape/dashboard/11 (1).png');
const headerImage = require('@/assets/drop-the-vape/progress/call_6NETPqOTnynP7gH8bLlRzNpl.png');

const dayMilestones = [1, 7, 14, 21, 30, 60, 90, 180, 365];
const healthRules = [
  { title: '20 minutes', body: 'Heart rate normalized', thresholdDays: 0 },
  { title: '24 hours', body: 'Nicotine leaving your body', thresholdDays: 1 },
  { title: '72 hours', body: 'Breathing improves', thresholdDays: 3 },
  { title: '2 Weeks', body: 'Energy levels increase', thresholdDays: 14 },
  { title: '3 Months', body: 'Stamina keeps improving', thresholdDays: 90 },
];
const achievementIconByKey: Record<string, number> = {
  first_day: achievementIcons[0],
  one_week: achievementIcons[1],
  two_weeks: achievementIcons[2],
  one_month: achievementIcons[3],
  strong_start: achievementIcons[2],
  getting_better: achievementIcons[2],
  streak_7: achievementIcons[1],
  saved_100: achievementIcons[3],
  avoided_100: achievementIcons[2],
};

const fallbackAchievements: ProgressMilestone[] = [
  { key: 'first_day', label: 'First Day', description: '24 hours vape-free', unlocked: false },
  { key: 'one_week', label: 'First Week', description: '7 days vape-free', unlocked: false },
  { key: 'two_weeks', label: 'Two Weeks', description: '14 days vape-free', unlocked: false },
  { key: 'one_month', label: 'One Month', description: '30 days vape-free', unlocked: false },
];

type ProgressDashboardProps = {
  progress: UserProgress;
  error?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenHome: () => void;
  onOpenProgress: () => void;
  activeTab?: 'home' | 'progress';
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function nextDayMilestone(days: number) {
  return dayMilestones.find((milestone) => milestone > days) ?? 365;
}

function healthPercent(days: number) {
  return Math.min(100, Math.floor((days / 43) * 100));
}

function reclaimedHours(vapesAvoided: number) {
  return Math.floor((vapesAvoided * 5) / 60);
}

function visibleHealthTimeline(days: number) {
  const completed = healthRules.filter((item) => days >= item.thresholdDays).slice(0, 3);
  const next = healthRules.find((item) => days < item.thresholdDays) ?? healthRules[healthRules.length - 1];
  return [...completed, { ...next, next: true }].slice(0, 4);
}

function graphSeries(progress: UserProgress) {
  const totalDays = Math.max(1, progress.daysVapeFree);
  const points = Array.from({ length: 7 }, (_, index) => {
    const day = Math.max(0, totalDays - 6 + index);
    const ratio = day / totalDays;
    return {
      label: `Day ${index + 1}`,
      streak: Math.round(progress.currentStreak * ratio),
      cravings: Math.round(Math.max(1, progress.vapesAvoided / 7) * ratio),
      checkins: Math.round(Math.max(1, progress.milestones.filter((item) => item.unlocked).length) * ratio),
    };
  });

  return points;
}

export function ProgressDashboard({ progress, error, isRefreshing, onRefresh, onRetry, onOpenAchievements, onOpenProfile, onOpenHome, onOpenProgress, activeTab = 'home' }: ProgressDashboardProps) {
  const nextMilestone = nextDayMilestone(progress.daysVapeFree);
  const nextPercent = Math.min(100, Math.round((progress.daysVapeFree / nextMilestone) * 100));
  const recovery = healthPercent(progress.daysVapeFree);
  const achievements = progress.milestones.length ? progress.milestones.slice(0, 4) : fallbackAchievements;
  const timeline = visibleHealthTimeline(progress.daysVapeFree);
  const chartData = graphSeries(progress);

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <ThemedText type="title" style={styles.title}>Your Progress</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>Keep going--every vape-free day is a step toward a healthier future.</ThemedText>
          </View>
          <Image source={headerImage} style={styles.heroImage} contentFit="cover" />
        </View>

        <View style={styles.streakPanel}>
          <View style={styles.streakMain}>
            <ThemedText type="headline" style={styles.streakTitle}>{progress.daysVapeFree} Days Vape-Free</ThemedText>
            <View style={styles.streakStats}>
              <MiniStat label="Current Streak" value={`${progress.currentStreak} Days`} />
              <View style={styles.divider} />
              <MiniStat label="Next Milestone" value={`${nextMilestone} Days`} />
            </View>
          </View>
          <View style={styles.ring}>
            <View style={[styles.ringFill, { transform: [{ rotate: `${Math.round(nextPercent * 3.6)}deg` }] }]} />
            <View style={styles.ringCenter}>
              <ThemedText type="headline" style={styles.ringValue}>{nextPercent}%</ThemedText>
              <ThemedText style={styles.ringLabel}>to next milestone</ThemedText>
            </View>
          </View>
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.error}>{error}</ThemedText><Button label="Try again" onPress={onRetry} /></View> : null}

        <View style={styles.metricGrid}>
          <MetricCard image={dashboardIcons[0]} title="Health Recovery" label="Lung recovery" value={`${recovery}%`} color="#FF5570" progress={recovery} />
          <MetricCard image={dashboardIcons[1]} title="Money Saved" value={money(progress.moneySaved)} color="#21B873" />
          <MetricCard image={dashboardIcons[2]} title="Puffs Avoided" value={String(progress.vapesAvoided)} color="#8B5CF6" />
          <MetricCard image={dashboardIcons[3]} title="Time Reclaimed" value={`${reclaimedHours(progress.vapesAvoided)} hours`} color="#1685FF" />
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.card, styles.timelineCard]}>
            <ThemedText type="smallBold" style={styles.cardTitle}>Health Timeline</ThemedText>
            <View style={styles.verticalLine} />
            {timeline.map((item) => {
              const isNext = 'next' in item && item.next;
              return <HealthTimelineItem key={item.title + (isNext ? '-next' : '-done')} title={item.title} body={item.body} next={isNext} />;
            })}
          </View>

          <View style={[styles.card, styles.achievementCard]}>
            <View style={styles.cardHeaderRow}>
              <ThemedText type="smallBold" style={styles.cardTitle}>Achievements</ThemedText>
              <Pressable onPress={onOpenAchievements}><ThemedText type="smallBold" style={styles.linkText}>View All</ThemedText></Pressable>
            </View>
            <View style={styles.achievementRow}>
              {achievements.map((item, index) => <AchievementItem key={item.key} item={item} index={index} />)}
            </View>
          </View>
        </View>

        <View style={styles.graphCard}>
          <ThemedText type="smallBold" style={styles.cardTitle}>Your Progress Over Time</ThemedText>
          <View style={styles.segmentRow}><Segment active label="7 Days" /><Segment label="30 Days" /><Segment label="90 Days" /></View>
          <ProgressGraph data={chartData} />
          <View style={styles.legendRow}>
            <Legend color="#1685FF" label="Daily Streak" />
            <Legend color="#22B989" label="Cravings Completed" />
            <Legend color="#8B5CF6" label="Check-ins" />
          </View>
        </View>

        <View style={styles.encourageCard}>
          <Image source={mountainImage} style={styles.mountain} contentFit="contain" />
          <View style={styles.encourageCopy}>
            <ThemedText type="smallBold" style={styles.encourageTitle}>You're doing amazing!</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Every craving you overcome makes the next one easier.</ThemedText>
          </View>
          <ThemedText style={styles.heart}>?</ThemedText>
        </View>
      </ScrollView>

      <View style={styles.bottomTabs}>
        <TabButton label="Home" icon="house" fallback="H" active={activeTab === 'home'} onPress={onOpenHome} />
        <TabButton label="Progress" icon="chart.bar" fallback="P" active={activeTab === 'progress'} onPress={onOpenProgress} />
        <TabButton label="Achievements" icon="trophy" fallback="A" onPress={onOpenAchievements} />
        <TabButton label="Profile" icon="person" fallback="M" onPress={onOpenProfile} />
      </View>
    </Screen>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.miniStat}><ThemedText style={styles.miniLabel}>{label}</ThemedText><ThemedText type="headline" style={styles.miniValue}>{value}</ThemedText></View>;
}

function MetricCard({ image, title, label, value, color, progress }: { image: number; title: string; label?: string; value: string; color: string; progress?: number }) {
  return <View style={styles.metricCard}><View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><Image source={image} style={styles.metricImage} contentFit="contain" /></View><View style={styles.metricText}><ThemedText type="smallBold" style={styles.metricTitle}>{title}</ThemedText>{label ? <ThemedText style={styles.metricLabel}>{label}</ThemedText> : null}<ThemedText type="headline" style={[styles.metricValue, { color }]}>{value}</ThemedText>{progress !== undefined ? <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} /></View> : null}</View></View>;
}

function HealthTimelineItem({ title, body, next }: { title: string; body: string; next?: boolean }) {
  return <View style={styles.healthItem}><View style={[styles.healthDot, next && styles.healthDotNext]}><ThemedText style={styles.healthDotText}>{next ? '' : '?'}</ThemedText></View><View><ThemedText type="smallBold" style={[styles.healthTitle, next && styles.nextTitle]}>{next ? 'Next' : title}</ThemedText>{next ? <ThemedText type="smallBold" style={styles.healthTitle}>{title}</ThemedText> : null}<ThemedText style={styles.healthBody}>{body}</ThemedText></View></View>;
}

function AchievementItem({ item, index }: { item: ProgressMilestone; index: number }) {
  const icon = achievementIconByKey[item.key] ?? achievementIcons[index % achievementIcons.length];
  return <View style={[styles.achievementItem, !item.unlocked && styles.locked]}><View style={styles.achievementBadge}>{item.unlocked ? <Image source={icon} style={styles.achievementImage} contentFit="contain" /> : <ThemedText style={styles.lockText}>?</ThemedText>}</View><ThemedText style={styles.achievementLabel}>{item.label}</ThemedText></View>;
}

function ProgressGraph({ data }: { data: ReturnType<typeof graphSeries> }) {
  const width = 230;
  const height = 112;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.streak, item.cravings, item.checkins]));
  const toPoint = (value: number, index: number) => ({ x: (index / (data.length - 1)) * width, y: height - (value / maxValue) * height });

  return <View style={[styles.graphPlot, { width, height: height + 20 }]}>{[0, 1, 2, 3].map((line) => <View key={line} style={[styles.gridLine, { top: line * 28 }]} />)}<GraphLine color="#1685FF" points={data.map((item, index) => toPoint(item.streak, index))} /><GraphLine color="#22B989" points={data.map((item, index) => toPoint(item.cravings, index))} /><GraphLine color="#8B5CF6" points={data.map((item, index) => toPoint(item.checkins, index))} /><View style={styles.xAxis}>{data.map((item) => <ThemedText key={item.label} style={styles.axisLabel}>{item.label}</ThemedText>)}</View></View>;
}

function GraphLine({ points, color }: { points: { x: number; y: number }[]; color: string }) {
  return <>{points.slice(0, -1).map((point, index) => <LineSegment key={`${color}-${index}`} from={point} to={points[index + 1]} color={color} />)}{points.map((point, index) => <View key={`${color}-dot-${index}`} style={[styles.point, { left: point.x - 3, top: point.y - 3, borderColor: color }]} />)}</>;
}

function LineSegment({ from, to, color }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = `${Math.atan2(dy, dx)}rad`;
  return <View style={[styles.segment, { left: from.x, top: from.y, width: length, backgroundColor: color, transform: [{ rotate: angle }] }]} />;
}

function Segment({ label, active }: { label: string; active?: boolean }) {
  return <View style={[styles.segmentButton, active && styles.segmentButtonActive]}><ThemedText style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</ThemedText></View>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><ThemedText style={styles.legendText}>{label}</ThemedText></View>;
}

function TabButton({ icon, fallback, label, active, onPress }: { icon: string; fallback: string; label: string; active?: boolean; onPress?: () => void }) {
  const color = active ? '#1685FF' : '#8B98AF';
  return <Pressable onPress={onPress} style={styles.tabButton}><View style={styles.tabIconWrap}><SymbolView name={icon as any} size={19} tintColor={color} fallback={<ThemedText style={[styles.tabIcon, active && styles.tabActive]}>{fallback}</ThemedText>} /></View><ThemedText style={[styles.tabLabel, active && styles.tabActive]}>{label}</ThemedText></Pressable>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4FAFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 92 },
  heroHeader: { minHeight: 124, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', borderRadius: 18, backgroundColor: '#F7FBFF', paddingLeft: Spacing.one },
  heroCopy: { flex: 1, gap: Spacing.two },
  title: { color: '#071B44', fontSize: 31, lineHeight: 36 },
  subtitle: { maxWidth: 210, lineHeight: 18 },
  heroImage: { width: 174, height: 124, marginRight: -22, backgroundColor: '#F7FBFF' },
  streakPanel: { minHeight: 124, borderRadius: 16, backgroundColor: '#082863', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three, ...Shadow.soft },
  streakMain: { flex: 1, gap: Spacing.three },
  streakTitle: { color: '#FFFFFF', fontSize: 20 },
  streakStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  miniStat: { gap: Spacing.one },
  miniLabel: { color: '#90A8D9', fontSize: 11 },
  miniValue: { color: '#FFFFFF', fontSize: 24, lineHeight: 28 },
  divider: { width: 1, height: 44, backgroundColor: '#31528B' },
  ring: { width: 94, height: 94, borderRadius: 47, borderWidth: 10, borderColor: '#1D4480', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ringFill: { position: 'absolute', width: 92, height: 92, borderRadius: 46, borderRightWidth: 10, borderRightColor: '#2D8CFF' },
  ringCenter: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#082863', alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: '#FFFFFF', fontSize: 24, lineHeight: 28 },
  ringLabel: { color: '#D8E8FF', fontSize: 9, lineHeight: 11, textAlign: 'center' },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  error: { color: '#DC2626', textAlign: 'center' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metricCard: { width: '48.7%', minHeight: 105, borderRadius: 14, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, ...Shadow.soft },
  metricIcon: { width: 43, height: 43, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  metricImage: { width: 34, height: 34 },
  metricText: { flex: 1, gap: Spacing.one },
  metricTitle: { color: '#071B44', fontSize: 11 },
  metricLabel: { color: '#6C7894', fontSize: 10 },
  metricValue: { fontSize: 20, lineHeight: 24 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#E7EDF6', overflow: 'hidden', marginTop: Spacing.two },
  progressFill: { height: 7, borderRadius: 4 },
  twoColumnRow: { flexDirection: 'row', gap: Spacing.two },
  card: { borderRadius: 14, backgroundColor: '#FFFFFF', padding: Spacing.three, ...Shadow.soft },
  timelineCard: { flex: 0.84, minHeight: 242 },
  achievementCard: { flex: 1.16, minHeight: 242, gap: Spacing.three },
  cardTitle: { color: '#071B44', fontSize: 13 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: '#1685FF', fontSize: 10 },
  verticalLine: { position: 'absolute', left: 25, top: 55, bottom: 28, width: 2, backgroundColor: '#BFEBD2' },
  healthItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, marginTop: Spacing.three },
  healthDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4EC37D', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  healthDotNext: { backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#56A7FF' },
  healthDotText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  healthTitle: { color: '#071B44', fontSize: 11, lineHeight: 14 },
  nextTitle: { color: '#1685FF' },
  healthBody: { color: '#687897', fontSize: 9, lineHeight: 12, maxWidth: 100 },
  achievementRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  achievementItem: { flex: 1, alignItems: 'center', gap: Spacing.one },
  achievementBadge: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F7FF', overflow: 'hidden' },
  achievementImage: { width: 52, height: 52 },
  achievementLabel: { color: '#071B44', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  locked: { opacity: 0.55 },
  lockText: { color: '#94A3B8', fontSize: 23 },
  graphCard: { borderRadius: 14, backgroundColor: '#FFFFFF', padding: Spacing.three, gap: Spacing.two, ...Shadow.soft },
  segmentRow: { flexDirection: 'row', gap: Spacing.two },
  segmentButton: { minWidth: 58, minHeight: 24, borderRadius: 7, borderWidth: 1, borderColor: '#D8E5F5', alignItems: 'center', justifyContent: 'center' },
  segmentButtonActive: { borderColor: '#1685FF', backgroundColor: '#EEF6FF' },
  segmentLabel: { color: '#6C7894', fontSize: 10 },
  segmentLabelActive: { color: '#1685FF', fontWeight: '800' },
  graphPlot: { alignSelf: 'center', marginTop: Spacing.two, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#E6EEF8' },
  segment: { position: 'absolute', height: 2, borderRadius: 2, transformOrigin: 'left center' },
  point: { position: 'absolute', width: 7, height: 7, borderRadius: 4, borderWidth: 2, backgroundColor: '#FFFFFF' },
  xAxis: { position: 'absolute', left: -10, right: -10, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' },
  axisLabel: { color: '#8794AD', fontSize: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: '#50607A', fontSize: 9 },
  encourageCard: { minHeight: 86, borderRadius: 16, backgroundColor: '#E8F5FF', flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, overflow: 'hidden', ...Shadow.soft },
  mountain: { width: 92, height: 78, marginLeft: -4 },
  encourageCopy: { flex: 1 },
  encourageTitle: { color: '#1685FF', fontSize: 15 },
  heart: { color: '#1685FF', fontSize: 38 },
  bottomTabs: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 72, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#DCEBFA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabButton: { alignItems: 'center', justifyContent: 'center', gap: Spacing.one, minWidth: 70 },
  tabIconWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#8B98AF', fontSize: 20 },
  tabLabel: { color: '#8B98AF', fontSize: 10 },
  tabActive: { color: '#1685FF', fontWeight: '800' },
});






