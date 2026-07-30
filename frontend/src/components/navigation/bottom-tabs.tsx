import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type BottomTabKey = 'home' | 'progress' | 'achievements' | 'profile' | 'settings';

type BottomTabsProps = {
  active: BottomTabKey;
  rightTab?: 'profile' | 'settings';
  variant?: 'floating' | 'flat';
  onOpenHome: () => void;
  onOpenProgress: () => void;
  onOpenPremium: () => void;
  onOpenAchievements: () => void;
  onOpenRightTab: () => void;
};

export function BottomTabs({
  active,
  rightTab = 'profile',
  variant = 'flat',
  onOpenHome,
  onOpenProgress,
  onOpenPremium,
  onOpenAchievements,
  onOpenRightTab,
}: BottomTabsProps) {
  const rightLabel = rightTab === 'settings' ? 'Settings' : 'Profile';
  const rightIcon = rightTab === 'settings' ? 'gearshape' : 'person';

  return (
    <View style={[styles.tabs, variant === 'floating' && styles.floatingTabs]}>
      <TabItem label="Home" icon="house" fallback="H" active={active === 'home'} onPress={onOpenHome} />
      <TabItem label="Progress" icon="chart.bar" fallback="P" active={active === 'progress'} onPress={onOpenProgress} />
      <Pressable accessibilityLabel="Open Premium" onPress={onOpenPremium} style={({ pressed }) => [styles.plusButton, pressed && styles.pressed]}>
        <SymbolView name={'plus' as any} size={25} tintColor="#FFFFFF" fallback={<ThemedText style={styles.plusText}>+</ThemedText>} />
      </Pressable>
      <TabItem label="Achievements" icon="trophy" fallback="A" active={active === 'achievements'} onPress={onOpenAchievements} />
      <TabItem label={rightLabel} icon={rightIcon} fallback={rightLabel[0]} active={active === rightTab} onPress={onOpenRightTab} />
    </View>
  );
}

function TabItem({ icon, fallback, label, active, onPress }: { icon: string; fallback: string; label: string; active?: boolean; onPress: () => void }) {
  const color = active ? '#3B82F6' : '#64748B';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}>
      <View style={styles.tabIconWrap}>
        <SymbolView name={icon as any} size={18} tintColor={color} fallback={<ThemedText style={[styles.tabFallback, active && styles.tabActive]}>{fallback}</ThemedText>} />
      </View>
      <ThemedText type="small" style={[styles.tabLabel, active && styles.tabActive]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 72, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAF5FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  floatingTabs: { left: Spacing.three, right: Spacing.three, bottom: Spacing.one, minHeight: 70, borderRadius: Radius.large, borderTopWidth: 0, ...Shadow.soft },
  tabItem: { width: 64, alignItems: 'center', justifyContent: 'center', gap: Spacing.half },
  tabIconWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  tabFallback: { color: '#64748B', fontSize: 16, fontWeight: '900' },
  tabLabel: { color: '#64748B', fontSize: 10 },
  tabActive: { color: '#3B82F6', fontWeight: '800' },
  plusButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', marginTop: -26, ...Shadow.soft },
  plusText: { color: '#FFFFFF', fontSize: 32, lineHeight: 36, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
