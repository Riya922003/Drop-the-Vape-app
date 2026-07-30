import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';

const heroImage = require('@/assets/drop-the-vape/paywall/drop-vape-journey-banner-generated.png');

type Plan = {
  name: string;
  price: string;
  cadence: string;
  note: string;
  icon: string;
  fallback: string;
  selected?: boolean;
};

const benefits = [
  'Unlimited Health Recovery Timeline',
  'Daily Motivation & Challenges',
  'Money Saved Calculator',
  'Community Support',
  'Advanced Progress Insights',
  'No Ads',
  'Unlock All Achievements',
];

const comparisonRows = [
  { feature: 'Vape-Free Streak', icon: 'flame', fallback: 'F', free: 'yes', premium: 'yes' },
  { feature: 'Health Timeline', icon: 'heart.fill', fallback: 'H', free: 'Limited', premium: 'Unlimited' },
  { feature: 'Money Saved', icon: 'dollarsign.circle', fallback: '$', free: 'Basic', premium: 'Advanced' },
  { feature: 'Achievements', icon: 'trophy', fallback: 'A', free: '5 Badges', premium: 'All Badges' },
  { feature: 'Community', icon: 'person.2', fallback: 'C', free: 'no', premium: 'yes' },
  { feature: 'No Ads', icon: 'nosign', fallback: 'N', free: 'no', premium: 'yes' },
];

const plans: Plan[] = [
  { name: 'Monthly', price: '$6.99', cadence: '/month', note: '', icon: 'calendar', fallback: 'M' },
  { name: 'Yearly', price: '$39.99', cadence: '/year', note: 'Save 52%', icon: 'calendar.badge.checkmark', fallback: 'Y', selected: true },
  { name: 'Lifetime', price: '$79.99', cadence: '', note: 'One-time payment', icon: 'diamond', fallback: 'L' },
];

export function PaywallScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <SymbolIcon name="xmark" fallback="X" color="#1E293B" size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <ThemedText type="headline" style={styles.title}>Upgrade to Premium</ThemedText>
            <ThemedText type="small" style={styles.subtitle}>Unlock everything you need for a successful vape-free journey.</ThemedText>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
          <ThemedText type="smallBold" style={styles.heroCaption}>Join thousands who are building healthier habits every day.</ThemedText>
        </View>

        <View style={styles.benefitGrid}>{benefits.map((benefit) => <Benefit key={benefit} label={benefit} />)}</View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <ThemedText type="smallBold" style={[styles.tableCell, styles.featureCell]}>Feature</ThemedText>
            <ThemedText type="smallBold" style={styles.tableCell}>Free</ThemedText>
            <View style={styles.premiumHeader}><SymbolIcon name="crown" fallback="P" color="#3B82F6" size={15} /><ThemedText type="smallBold" style={styles.premiumText}>Premium</ThemedText></View>
          </View>
          {comparisonRows.map((row) => <ComparisonRow key={row.feature} {...row} />)}
        </View>

        <View style={styles.planRow}>{plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</View>

        <Pressable style={({ pressed }) => [styles.trialButton, pressed && styles.pressed]}>
          <SymbolIcon name="sparkles" fallback="*" color="#FFFFFF" size={18} />
          <ThemedText type="smallBold" style={styles.trialText}>Start 7-Day Free Trial</ThemedText>
        </Pressable>
        <ThemedText type="small" style={styles.cancelText}>Cancel anytime.</ThemedText>

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.freeButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.freeText}>Continue with Free Version</ThemedText>
        </Pressable>

        <View style={styles.footerLinks}>
          <FooterLink icon="shield" fallback="P" label="Privacy Policy" />
          <FooterLink icon="doc.text" fallback="T" label="Terms of Service" />
          <FooterLink icon="arrow.clockwise" fallback="R" label="Restore Purchases" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Benefit({ label }: { label: string }) {
  return <View style={styles.benefit}><SymbolIcon name="checkmark.circle.fill" fallback="Y" color="#22C55E" size={16} /><ThemedText type="smallBold" style={styles.benefitText}>{label}</ThemedText></View>;
}

function ComparisonRow({ feature, icon, fallback, free, premium }: { feature: string; icon: string; fallback: string; free: string; premium: string }) {
  return (
    <View style={styles.tableRow}>
      <View style={[styles.featureCell, styles.featureContent]}><SymbolIcon name={icon} fallback={fallback} color="#3B82F6" size={15} /><ThemedText type="smallBold" style={styles.featureText}>{feature}</ThemedText></View>
      <ComparisonValue value={free} />
      <ComparisonValue value={premium} premium />
    </View>
  );
}

function ComparisonValue({ value, premium }: { value: string; premium?: boolean }) {
  if (value === 'yes') {
    return <View style={styles.tableCell}><SymbolIcon name="checkmark.circle.fill" fallback="Y" color="#22C55E" size={15} /></View>;
  }

  if (value === 'no') {
    return <View style={styles.tableCell}><SymbolIcon name="xmark.circle.fill" fallback="N" color="#DC2626" size={15} /></View>;
  }

  return <ThemedText type="smallBold" style={[styles.tableCell, premium && styles.premiumValue]}>{value}</ThemedText>;
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Pressable style={({ pressed }) => [styles.planCard, plan.selected && styles.planSelected, pressed && styles.pressed]}>
      <View style={[styles.radio, plan.selected && styles.radioSelected]}>{plan.selected ? <SymbolIcon name="checkmark" fallback="Y" color="#FFFFFF" size={11} /> : null}</View>
      {plan.selected ? <View style={styles.bestBadge}><ThemedText type="smallBold" style={styles.bestText}>Best Value</ThemedText></View> : null}
      <View style={styles.planIcon}><SymbolIcon name={plan.icon} fallback={plan.fallback} color="#3B82F6" size={24} /></View>
      <ThemedText type="smallBold" style={styles.planName}>{plan.name}</ThemedText>
      {plan.note && !plan.selected ? <ThemedText type="small" style={styles.planNote}>{plan.note}</ThemedText> : null}
      <View style={styles.priceRow}><ThemedText type="headline" style={styles.price}>{plan.price}</ThemedText>{plan.cadence ? <ThemedText type="small" style={styles.cadence}>{plan.cadence}</ThemedText> : null}</View>
      {plan.selected ? <View style={styles.savePill}><ThemedText type="smallBold" style={styles.saveText}>{plan.note}</ThemedText></View> : null}
      {plan.name === 'Lifetime' ? <ThemedText type="small" style={styles.lifetimeText}>Perfect for users committed to quitting for good.</ThemedText> : null}
    </Pressable>
  );
}

function FooterLink({ icon, fallback, label }: { icon: string; fallback: string; label: string }) {
  return <View style={styles.footerLink}><SymbolIcon name={icon} fallback={fallback} color="#64748B" size={14} /><ThemedText type="small" style={styles.footerText}>{label}</ThemedText></View>;
}

function SymbolIcon({ name, fallback, color, size }: { name: string; fallback: string; color: string; size: number }) {
  return <SymbolView name={name as any} size={size} tintColor={color} fallback={<ThemedText style={{ color, fontSize: size - 1, fontWeight: '900' }}>{fallback}</ThemedText>} />;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: 0 },
  content: { gap: Spacing.two, paddingBottom: Spacing.three },
  header: { minHeight: 66, alignItems: 'center', justifyContent: 'center' },
  closeButton: { position: 'absolute', left: 0, top: 4, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  headerCopy: { alignItems: 'center', gap: Spacing.one },
  title: { color: '#1E293B', fontSize: 26, lineHeight: 31, textAlign: 'center' },
  subtitle: { color: '#64748B', fontSize: 12, lineHeight: 16, textAlign: 'center' },
  heroCard: { borderRadius: Radius.medium, backgroundColor: '#FFFFFF', overflow: 'hidden', ...Shadow.soft },
  heroImage: { width: '100%', height: 150, backgroundColor: '#EAF5FF' },
  heroCaption: { color: '#64748B', fontSize: 11, textAlign: 'center', paddingVertical: Spacing.two },
  benefitGrid: { borderRadius: Radius.medium, backgroundColor: '#FFFFFF', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, padding: Spacing.one, ...Shadow.soft },
  benefit: { width: '49%', minHeight: 32, borderRadius: Radius.small, borderWidth: 1, borderColor: '#EAF5FF', flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.two },
  benefitText: { flex: 1, color: '#1E293B', fontSize: 10, lineHeight: 13 },
  tableCard: { borderRadius: Radius.medium, backgroundColor: '#FFFFFF', overflow: 'hidden', ...Shadow.soft },
  tableHeader: { minHeight: 38, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAF5FF' },
  tableRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EAF5FF' },
  tableCell: { flex: 1, alignItems: 'center', justifyContent: 'center', color: '#1E293B', fontSize: 10, textAlign: 'center' },
  featureCell: { flex: 1.35 },
  featureContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, justifyContent: 'flex-start', paddingLeft: Spacing.three },
  featureText: { flex: 1, color: '#1E293B', fontSize: 10 },
  premiumHeader: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
  premiumText: { color: '#3B82F6', fontSize: 10 },
  premiumValue: { color: '#3B82F6' },
  planRow: { flexDirection: 'row', gap: Spacing.two },
  planCard: { flex: 1, minHeight: 158, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#EAF5FF', backgroundColor: '#FFFFFF', alignItems: 'center', padding: Spacing.two, gap: Spacing.one, ...Shadow.soft },
  planSelected: { borderColor: '#3B82F6', borderWidth: 2 },
  radio: { position: 'absolute', top: 8, left: 8, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#64748B', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
  bestBadge: { position: 'absolute', top: 7, right: 8 },
  bestText: { color: '#22C55E', fontSize: 9 },
  planIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF5FF', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.three },
  planName: { color: '#1E293B', fontSize: 13 },
  planNote: { color: '#64748B', fontSize: 9, textAlign: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  price: { color: '#3B82F6', fontSize: 18, lineHeight: 22 },
  cadence: { color: '#1E293B', fontSize: 10, marginBottom: 1 },
  savePill: { borderRadius: Radius.pill, backgroundColor: '#EAF5FF', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
  saveText: { color: '#3B82F6', fontSize: 9 },
  lifetimeText: { color: '#64748B', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  trialButton: { minHeight: 48, borderRadius: Radius.medium, backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, ...Shadow.soft },
  trialText: { color: '#FFFFFF', fontSize: 16 },
  cancelText: { color: '#64748B', fontSize: 10, textAlign: 'center', marginTop: -Spacing.one },
  freeButton: { minHeight: 42, borderRadius: Radius.small, borderWidth: 1, borderColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  freeText: { color: '#3B82F6', fontSize: 13 },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two, paddingTop: Spacing.one },
  footerLink: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one },
  footerText: { color: '#64748B', fontSize: 9, lineHeight: 12 },
  pressed: { opacity: 0.75 },
});