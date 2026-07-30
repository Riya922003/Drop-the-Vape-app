import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type QuitGoalOption = {
  title: string;
  value: string;
  description?: string;
};

type QuitGoalStepProps = {
  options: QuitGoalOption[];
  value: string;
  onChange: (value: string) => void;
};

function getGoalIcon(value: string) {
  switch (value) {
    case 'quit_good':
      return { label: 'G', backgroundColor: '#EAF5FF', color: '#3B82F6' };
    case 'cut_down':
      return { label: 'D', backgroundColor: '#EAF5FF', color: '#22C55E' };
    case 'specific_date':
      return { label: 'S', backgroundColor: '#EAF5FF', color: '#22C55E' };
    case 'health':
      return { label: 'H', backgroundColor: '#EAF5FF', color: '#3B82F6' };
    default:
      return { label: '?', backgroundColor: '#EAF5FF', color: '#3B82F6' };
  }
}

export function QuitGoalStep({ options, value, onChange }: QuitGoalStepProps) {
  return (
    <>
      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          Choose Your Quit Goal
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Pick the goal that motivates you most.{`\n`}You can always change it later.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option.value;
          const icon = getGoalIcon(option.value);

          return (
            <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.pressable}>
              <View style={[styles.card, selected && styles.cardSelected]}>
                <View style={[styles.icon, { backgroundColor: icon.backgroundColor }]}>
                  <ThemedText type="headline" style={[styles.iconText, { color: icon.color }]}>
                    {icon.label}
                  </ThemedText>
                </View>
                <View style={styles.optionCopy}>
                  <ThemedText type="headline" style={styles.optionTitle}>
                    {option.title}
                  </ThemedText>
                  {option.description ? (
                    <ThemedText type="small" style={styles.optionDescription}>
                      {option.description}
                    </ThemedText>
                  ) : null}
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: Spacing.one,
    alignItems: 'center',
  },
  title: {
    maxWidth: 340,
    textAlign: 'center',
    color: '#1E293B',
    fontSize: 31,
    lineHeight: 36,
  },
  description: {
    maxWidth: 310,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 22,
  },
  options: {
    gap: Spacing.two,
  },
  pressable: {
    borderRadius: Radius.medium,
  },
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: '#EAF5FF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    ...Shadow.soft,
  },
  cardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
    lineHeight: 30,
  },
  optionCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  optionTitle: {
    color: '#1E293B',
    fontSize: 18,
    lineHeight: 22,
  },
  optionDescription: {
    color: '#64748B',
    lineHeight: 18,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
});
