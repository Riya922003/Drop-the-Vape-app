import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type SetupOption = {
  title: string;
  value: string;
};

type SetupOptionGridProps = {
  options: SetupOption[];
  value: string;
  onChange: (value: string) => void;
};

function getOptionIcon(option: SetupOption) {
  const title = option.title.toLowerCase();

  if (option.value === 'health') {
    return { label: 'H', backgroundColor: '#FFF7F7', color: '#DC2626' };
  }

  if (option.value === 'money') {
    return { label: '$', backgroundColor: '#EAF5FF', color: '#22C55E' };
  }

  if (option.value === 'family') {
    return { label: 'F', backgroundColor: '#EAF5FF', color: '#22C55E' };
  }

  if (option.value === 'control') {
    return { label: 'C', backgroundColor: '#EAF5FF', color: '#22C55E' };
  }

  if (option.value === 'breathing') {
    return { label: 'B', backgroundColor: '#EAF5FF', color: '#3B82F6' };
  }

  if (title.includes('few')) {
    return { label: 'W', backgroundColor: '#EAF5FF', color: '#3B82F6' };
  }

  if (title.includes('1-3')) {
    return { label: 'T', backgroundColor: '#EAF5FF', color: '#22C55E' };
  }

  if (title.includes('4-10')) {
    return { label: 'M', backgroundColor: '#EAF5FF', color: '#22C55E' };
  }

  if (title.includes('more than')) {
    return { label: 'H', backgroundColor: '#FFF7F7', color: '#DC2626' };
  }

  if (title.includes('constantly')) {
    return { label: 'A', backgroundColor: '#EAF5FF', color: '#3B82F6' };
  }

  return { label: '?', backgroundColor: '#EAF5FF', color: '#3B82F6' };
}

export function SetupOptionGrid({ options, value, onChange }: SetupOptionGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = value === option.value;
        const icon = getOptionIcon(option);

        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.pressable}>
            <View style={[styles.card, selected && styles.cardSelected]}>
              <View style={[styles.icon, { backgroundColor: icon.backgroundColor }]}>
                <ThemedText type="headline" style={[styles.iconText, { color: icon.color }]}>
                  {icon.label}
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={styles.title}>
                {option.title}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pressable: {
    width: '48.6%',
    borderRadius: Radius.medium,
  },
  card: {
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: '#EAF5FF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
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
  title: {
    maxWidth: 112,
    minHeight: 40,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
