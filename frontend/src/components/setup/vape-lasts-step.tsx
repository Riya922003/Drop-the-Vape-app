import { Image } from 'expo-image';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type DurationOption = {
  title: string;
  value: string;
};

type VapeLastsStepProps = {
  options: DurationOption[];
  value: string;
  weeklyVapes: number;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
};

const PRESET_VALUES = new Set(['0.5', '1', '3', '6', '8']);

export function VapeLastsStep({ options, value, weeklyVapes, isLoading, onChange, onContinue, onSkip }: VapeLastsStepProps) {
  const customSelected = Boolean(value) && !PRESET_VALUES.has(value);
  const customValue = customSelected ? value : '';
  const safeWeeklyVapes = Number.isFinite(weeklyVapes) && weeklyVapes > 0 ? weeklyVapes : 0;
  const yearlyVapes = Math.round(safeWeeklyVapes * 52);

  return (
    <View style={styles.wrap}>
      <View style={styles.brandBlock}>
        <Image source={require('@/assets/drop-the-vape/logo.png')} style={styles.logoImage} contentFit="contain" />
        <ThemedText type="smallBold" style={styles.logoText}>
          Drop Vape
        </ThemedText>
      </View>

      <View style={styles.progressLine}>
        <View style={styles.progressSegmentActive} />
        <View style={styles.progressDotActive} />
        <View style={styles.progressSegmentActive} />
        <View style={styles.progressDotActive} />
        <View style={styles.progressSegment} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          How long does{`\n`}
          <ThemedText type="subtitle" style={styles.titleAccent}>
            one vape
          </ThemedText>{' '}
          usually last?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          This helps us estimate how many vapes you&apos;ve avoided.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.optionPressable}>
              <View style={styles.optionRow}>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>{selected ? <View style={styles.radioInner} /> : null}</View>
                <ThemedText type="smallBold" style={styles.optionTitle}>
                  {option.title}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.customRow}>
          <Pressable onPress={() => onChange(customValue || '0.5')} style={styles.customRadioPressable}>
            <View style={[styles.radioOuter, customSelected && styles.radioOuterSelected]}>{customSelected ? <View style={styles.radioInner} /> : null}</View>
          </Pressable>
          <ThemedText type="smallBold" style={styles.customLabel}>
            Custom
          </ThemedText>
          <TextInput
            value={customValue}
            onChangeText={onChange}
            placeholder="0.5"
            keyboardType="decimal-pad"
            placeholderTextColor="#64748B"
            style={styles.customInput}
          />
          <ThemedText type="small" themeColor="textSecondary">
            days
          </ThemedText>
        </View>
      </View>

      <View style={styles.previewBlock}>
        <View style={styles.previewHeader}>
          <View style={styles.previewDot} />
          <View>
            <ThemedText type="smallBold" style={styles.previewTitle}>
              Live Preview
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.previewSubtitle}>
              Estimated
            </ThemedText>
          </View>
        </View>
        <View style={styles.previewStats}>
          <View style={styles.previewStat}>
            <ThemedText type="subtitle" style={styles.previewGreen}>
              {safeWeeklyVapes || 0}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.previewLabel}>
              vapes/week
            </ThemedText>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewStat}>
            <ThemedText type="subtitle" style={styles.previewBlue}>
              {yearlyVapes || 0}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.previewLabel}>
              vapes/year
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable disabled={isLoading} onPress={onContinue} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isLoading && styles.disabled]}>
        <ThemedText type="headline" style={styles.primaryButtonText}>
          {isLoading ? 'Saving...' : 'Continue ->'}
        </ThemedText>
      </Pressable>

      <Pressable disabled={isLoading} onPress={onSkip} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Skip
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.three,
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logoImage: { width: 48, height: 48 },
  logoText: {
    color: '#1E293B',
    fontSize: 18,
    lineHeight: 24,
  },
  progressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
  },
  progressSegmentActive: {
    width: 72,
    height: 1,
    backgroundColor: '#3B82F6',
  },
  progressSegment: {
    width: 72,
    height: 1,
    backgroundColor: '#EAF5FF',
  },
  progressDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAF5FF',
  },
  copy: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  title: {
    maxWidth: 320,
    textAlign: 'center',
    color: '#1E293B',
    fontSize: 30,
    lineHeight: 36,
  },
  titleAccent: {
    color: '#3B82F6',
    fontSize: 30,
    lineHeight: 36,
  },
  description: {
    maxWidth: 280,
    textAlign: 'center',
    lineHeight: 20,
  },
  options: {
    gap: Spacing.two,
  },
  optionPressable: {
    borderRadius: Radius.small,
  },
  optionRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF5FF',
  },
  optionTitle: {
    color: '#1E293B',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  customRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  customRadioPressable: {
    paddingVertical: Spacing.two,
  },
  customLabel: {
    flex: 1,
    color: '#1E293B',
  },
  customInput: {
    width: 104,
    height: 38,
    borderWidth: 1,
    borderColor: '#EAF5FF',
    borderRadius: Radius.small,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    fontWeight: '700',
  },
  previewBlock: {
    gap: Spacing.two,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  previewDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  previewTitle: {
    color: '#3B82F6',
  },
  previewSubtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  previewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewStat: {
    flex: 1,
    alignItems: 'center',
  },
  previewDivider: {
    width: 1,
    height: 52,
    backgroundColor: '#EAF5FF',
  },
  previewGreen: {
    color: '#22C55E',
  },
  previewBlue: {
    color: '#3B82F6',
  },
  previewLabel: {
    color: '#1E293B',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    ...Shadow.soft,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
  },
  skipButton: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.55,
  },
});
