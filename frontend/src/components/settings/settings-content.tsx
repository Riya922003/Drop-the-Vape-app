import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabs } from '@/components/navigation/bottom-tabs';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import type { UserProgress } from '@/lib/progress-api';
import type { QuitProfile } from '@/lib/quit-profile-api';

const avatarImage = require('@/assets/drop-the-vape/dashboard/call_pC6LGKdabUMWxsSBYWFaOye1.png');

type SettingsContentProps = {
  progress: UserProgress;
  quitProfile: QuitProfile;
  error?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onBack: () => void;
  onOpenHome: () => void;
  onOpenProgress: () => void;
  onOpenPremium: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

type RowProps = {
  icon: string;
  fallback: string;
  label: string;
  caption?: string;
  value?: string;
  danger?: boolean;
  toggle?: boolean;
  enabled?: boolean;
  onToggle?: () => void;
};

function formatDate(value?: string) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(value));
}

export function SettingsContent({ progress, quitProfile, error, isRefreshing, onRefresh, onRetry, onBack, onOpenHome, onOpenProgress, onOpenPremium, onOpenAchievements, onOpenSettings, onLogout }: SettingsContentProps) {
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [motivationalMessages, setMotivationalMessages] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const badgesEarned = progress.milestones.filter((item) => item.unlocked).length;

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <SymbolIcon name="chevron.left" fallback="<" color="#1E293B" size={24} />
          </Pressable>
          <ThemedText type="headline" style={styles.title}>Settings</ThemedText>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.cloudLarge} />
          <View style={styles.cloudSmall} />
          <View style={styles.vapeOutline} />
          <View style={styles.heroHeader}>
            <View style={styles.avatarWrap}>
              <Image source={avatarImage} style={styles.avatarImage} contentFit="cover" />
              <View style={styles.cameraBadge}><SymbolIcon name="camera" fallback="o" color="#FFFFFF" size={11} /></View>
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="headline" style={styles.name}>Alex Johnson</ThemedText>
              <ThemedText type="small" style={styles.memberText}>Member since {formatDate(quitProfile.setupCompletedAt)}</ThemedText>
            </View>
          </View>
          <View style={styles.heroStats}>
            <HeroStat icon="flame" fallback="F" value={`${progress.currentStreak}`} label="Day Streak" />
            <HeroStat icon="heart.fill" fallback="H" value={`${Math.max(0, progress.goal.percent)}%`} label="Health Recovery" />
            <HeroStat icon="trophy" fallback="T" value={`${badgesEarned}`} label="Badges Earned" />
          </View>
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.errorText}>{error}</ThemedText><Button label="Try again" onPress={onRetry} /></View> : null}

        <SettingsSection title="Preferences" icon="gearshape" fallback="G">
          <SettingsRow icon="paintpalette" fallback="A" label="Appearance" value="Light" />
          <SettingsRow icon="globe" fallback="L" label="Language" value="English" />
          <SettingsRow icon="ruler" fallback="U" label="Units" value="Metric (kg, cm)" />
        </SettingsSection>

        <SettingsSection title="Notifications" icon="bell" fallback="N">
          <SettingsRow icon="bell" fallback="D" label="Daily Reminder" value="8:00 PM" />
          <SettingsRow icon="chart.line.uptrend.xyaxis" fallback="P" label="Progress Updates" caption="Get weekly progress and insights" toggle enabled={progressUpdates} onToggle={() => setProgressUpdates((value) => !value)} />
          <SettingsRow icon="message" fallback="M" label="Motivational Messages" caption="Receive motivational quotes and tips" toggle enabled={motivationalMessages} onToggle={() => setMotivationalMessages((value) => !value)} />
          <SettingsRow icon="trophy" fallback="A" label="Achievement Alerts" caption="Get notified when you earn badges" toggle enabled={achievementAlerts} onToggle={() => setAchievementAlerts((value) => !value)} />
        </SettingsSection>

        <SettingsSection title="Journey & Data" icon="chart.bar" fallback="J">
          <SettingsRow icon="icloud.and.arrow.up" fallback="B" label="Backup & Sync" caption="Keep your data safe across devices" />
          <SettingsRow icon="square.and.arrow.down" fallback="E" label="Export My Data" caption="Download your journey data" />
          <SettingsRow icon="trash" fallback="R" label="Reset Journey" caption="This will reset all your progress" danger />
        </SettingsSection>

        <SettingsSection title="Support" icon="questionmark.circle" fallback="S">
          <SettingsRow icon="questionmark.circle" fallback="H" label="Help Center" />
          <SettingsRow icon="message" fallback="C" label="Contact Support" />
          <SettingsRow icon="star" fallback="R" label="Rate the App" />
          <SettingsRow icon="square.and.arrow.up" fallback="S" label="Share with Friends" />
        </SettingsSection>

        <SettingsSection title="About" icon="info.circle" fallback="A">
          <SettingsRow icon="shield" fallback="P" label="Privacy Policy" />
          <SettingsRow icon="doc.text" fallback="T" label="Terms of Service" />
          <SettingsRow icon="info.circle" fallback="V" label="App Version" value="1.2.0" noChevron />
        </SettingsSection>

        <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <SymbolIcon name="rectangle.portrait.and.arrow.right" fallback=">" color="#DC2626" size={16} />
          <ThemedText type="smallBold" style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </ScrollView>
      <BottomTabs active="settings" rightTab="settings" onOpenHome={onOpenHome} onOpenProgress={onOpenProgress} onOpenPremium={onOpenPremium} onOpenAchievements={onOpenAchievements} onOpenRightTab={onOpenSettings} />
    </Screen>
  );
}

function SettingsSection({ title, icon, fallback, children }: { title: string; icon: string; fallback: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SymbolIcon name={icon} fallback={fallback} color="#3B82F6" size={18} />
        <ThemedText type="smallBold" style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      <View style={styles.rowList}>{children}</View>
    </View>
  );
}

function SettingsRow({ icon, fallback, label, caption, value, danger, toggle, enabled, onToggle, noChevron }: RowProps & { noChevron?: boolean }) {
  return (
    <Pressable onPress={toggle ? onToggle : undefined} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.rowIcon}><SymbolIcon name={icon} fallback={fallback} color={danger ? '#DC2626' : '#3B82F6'} size={16} /></View>
      <View style={styles.rowCopy}>
        <ThemedText type="smallBold" style={[styles.rowLabel, danger && styles.dangerText]}>{label}</ThemedText>
        {caption ? <ThemedText type="small" style={styles.rowCaption}>{caption}</ThemedText> : null}
      </View>
      {toggle ? <Toggle enabled={Boolean(enabled)} /> : <RowEnd value={value} danger={danger} noChevron={noChevron} />}
    </Pressable>
  );
}

function RowEnd({ value, danger, noChevron }: { value?: string; danger?: boolean; noChevron?: boolean }) {
  return (
    <View style={styles.rowEnd}>
      {value ? <ThemedText type="small" style={[styles.rowValue, danger && styles.dangerText]} numberOfLines={1}>{value}</ThemedText> : null}
      {!noChevron ? <ThemedText style={[styles.chevron, danger && styles.dangerText]}>&gt;</ThemedText> : null}
    </View>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return <View style={[styles.toggle, enabled && styles.toggleOn]}><View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} /></View>;
}

function HeroStat({ icon, fallback, value, label }: { icon: string; fallback: string; value: string; label: string }) {
  return <View style={styles.heroStat}><View style={styles.heroStatIcon}><SymbolIcon name={icon} fallback={fallback} color="#22C55E" size={18} /></View><View><ThemedText type="headline" style={styles.heroValue}>{value}</ThemedText><ThemedText type="small" style={styles.heroLabel}>{label}</ThemedText></View></View>;
}

function SymbolIcon({ name, fallback, color, size }: { name: string; fallback: string; color: string; size: number }) {
  return <SymbolView name={name as any} size={size} tintColor={color} fallback={<ThemedText style={{ color, fontSize: size - 1, fontWeight: '900' }}>{fallback}</ThemedText>} />;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.three, paddingBottom: 96 },
  topBar: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  backButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#1E293B', fontSize: 26, lineHeight: 32 },
  heroCard: { minHeight: 138, borderRadius: Radius.large, backgroundColor: '#EAF5FF', padding: Spacing.three, gap: Spacing.three, overflow: 'hidden', ...Shadow.soft },
  cloudLarge: { position: 'absolute', right: 42, top: 48, width: 74, height: 28, borderRadius: 16, backgroundColor: '#FFFFFF', opacity: 0.78 },
  cloudSmall: { position: 'absolute', right: 18, top: 78, width: 54, height: 20, borderRadius: 12, backgroundColor: '#FFFFFF', opacity: 0.44 },
  vapeOutline: { position: 'absolute', right: 26, top: 24, width: 17, height: 72, borderWidth: 4, borderColor: '#3B82F6', borderRadius: 7, transform: [{ rotate: '26deg' }], opacity: 0.58 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EAF5FF', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  cameraBadge: { position: 'absolute', right: -2, bottom: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  name: { color: '#1E293B', fontSize: 20, lineHeight: 25 },
  memberText: { color: '#64748B', fontSize: 11 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  heroStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  heroStatIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  heroValue: { color: '#1E293B', fontSize: 17, lineHeight: 21 },
  heroLabel: { color: '#64748B', fontSize: 9, lineHeight: 11 },
  section: { borderRadius: Radius.medium, backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, ...Shadow.soft },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingBottom: Spacing.two, borderBottomWidth: 1, borderBottomColor: '#EAF5FF' },
  sectionTitle: { color: '#1E293B', fontSize: 14 },
  rowList: { overflow: 'hidden' },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderBottomWidth: 1, borderBottomColor: '#EAF5FF' },
  rowIcon: { width: 22, alignItems: 'center' },
  rowCopy: { flex: 1, justifyContent: 'center' },
  rowLabel: { color: '#1E293B', fontSize: 12, lineHeight: 16 },
  rowCaption: { color: '#64748B', fontSize: 9, lineHeight: 12 },
  rowEnd: { maxWidth: 148, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowValue: { color: '#64748B', fontSize: 11 },
  chevron: { color: '#64748B', fontSize: 14, fontWeight: '900' },
  toggle: { width: 42, height: 24, borderRadius: 12, backgroundColor: '#EAF5FF', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#3B82F6' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  logoutButton: { minHeight: 48, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF7F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  logoutText: { color: '#DC2626', fontSize: 13 },
  errorCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.large, backgroundColor: '#FFF7F7', padding: Spacing.three },
  errorText: { color: '#DC2626', textAlign: 'center' },
  dangerText: { color: '#DC2626' },
  pressed: { opacity: 0.75 },
});
