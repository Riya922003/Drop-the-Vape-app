import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type SetupStepFrameProps = {
  children: React.ReactNode;
  stepNumber: number;
  stepLabel: string;
  activeDotIndex: number;
};

const DOTS = [0, 1, 2, 3, 4];

export function SetupStepFrame({ children, stepNumber, stepLabel, activeDotIndex }: SetupStepFrameProps) {
  return (
    <>
      <View style={styles.brandBlock}>
        <View style={styles.logoMark}>
          <ThemedText type="headline" style={styles.logoIcon}>
            D
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={styles.logoText}>
          Drop Vape
        </ThemedText>
      </View>

      {children}

      <View style={styles.stepCard}>
        <View style={styles.stepBadge}>
          <ThemedText type="smallBold" style={styles.stepBadgeText}>
            {stepNumber}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={styles.stepLabel}>
          {stepLabel}
        </ThemedText>
        <View style={styles.dots}>
          {DOTS.map((dot) => (
            <View key={dot} style={[styles.dot, dot === activeDotIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5FF',
    borderWidth: 1,
    borderColor: '#BBD8FF',
  },
  logoIcon: {
    color: '#3B82F6',
    fontSize: 20,
    lineHeight: 24,
  },
  logoText: {
    color: '#0B1F44',
  },
  stepCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
    ...Shadow.soft,
  },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D8EAFF',
  },
  stepBadgeText: {
    color: '#3B82F6',
  },
  stepLabel: {
    flex: 1,
    color: '#0B1F44',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DDEAF7',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
  },
});
