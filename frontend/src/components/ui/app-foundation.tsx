import { Pressable, StyleSheet, TextInput, type TextInputProps, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ViewProps & {
  centered?: boolean;
};

export function Screen({ children, centered, style, ...props }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.screen, centered && styles.centered, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress?: () => void;
};

export function Button({ label, variant = 'primary', disabled, onPress }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: isPrimary ? theme.primary : theme.primarySoft },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <ThemedText type="smallBold" style={{ color: isPrimary ? Colors.light.white : theme.primary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type AppTextInputProps = TextInputProps & {
  label: string;
};

export function AppTextInput({ label, style, ...props }: AppTextInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: theme.white,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

type OptionCardProps = {
  title: string;
  description?: string;
  selected?: boolean;
};

export function OptionCard({ title, description, selected }: OptionCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.optionCard,
        {
          backgroundColor: selected ? theme.primarySoft : theme.white,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  positive?: boolean;
};

export function StatCard({ label, value, positive }: StatCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
      <ThemedText type="headline" style={{ color: positive ? theme.accent : theme.text }}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

type ProgressRingProps = {
  percent: number;
};

export function ProgressRing({ percent }: ProgressRingProps) {
  const theme = useTheme();
  const safePercent = Math.max(0, Math.min(percent, 100));

  return (
    <View style={[styles.ringOuter, { borderColor: theme.primarySoft }]}>
      <View style={[styles.ringInner, { borderColor: theme.primary }]}>
        <ThemedText type="headline">{safePercent}%</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          goal
        </ThemedText>
      </View>
    </View>
  );
}

type AchievementBadgeProps = {
  label: string;
  unlocked?: boolean;
};

export function AchievementBadge({ label, unlocked }: AchievementBadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: unlocked ? '#EAF5FF' : theme.backgroundElement,
          borderColor: unlocked ? theme.accent : theme.border,
        },
      ]}>
      <View style={[styles.badgeDot, { backgroundColor: unlocked ? theme.accent : theme.textSecondary }]} />
      <ThemedText type="smallBold">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  centered: {
    justifyContent: 'center',
  },
  button: {
    minHeight: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 0.55,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  optionCard: {
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    ...Shadow.soft,
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    justifyContent: 'center',
    ...Shadow.soft,
  },
  ringOuter: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

