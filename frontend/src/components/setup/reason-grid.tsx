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
    return { label: 'H', backgroundColor: '#FFECEC', color: '#FF5D5D' };
  }

  if (option.value === 'money') {
    return { label: '$', backgroundColor: '#ECF8D8', color: '#67B741' };
  }

  if (option.value === 'family') {
    return { label: 'F', backgroundColor: '#FFF0DE', color: '#F59E0B' };
  }

  if (option.value === 'control') {
    return { label: 'C', backgroundColor: '#FFF3CF', color: '#F2A51A' };
  }

  if (option.value === 'breathing') {
    return { label: 'B', backgroundColor: '#E7F5FF', color: '#3B82F6' };
  }

  if (title.includes('few')) {
    return { label: 'W', backgroundColor: '#E7F1FF', color: '#3B82F6' };
  }

  if (title.includes('1-3')) {
    return { label: 'T', backgroundColor: '#EAFBEF', color: '#22C55E' };
  }

  if (title.includes('4-10')) {
    return { label: 'M', backgroundColor: '#FFF4D8', color: '#F59E0B' };
  }

  if (title.includes('more than')) {
    return { label: 'H', backgroundColor: '#FFECEC', color: '#FF5D5D' };
  }

  if (title.includes('constantly')) {
    return { label: 'A', backgroundColor: '#F0E8FF', color: '#7C3AED' };
  }

  return { label: '?', backgroundColor: '#E7F5FF', color: '#3B82F6' };
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
    borderColor: '#DDEAF7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    ...Shadow.soft,
  },
  cardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FBFF',
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
    color: '#0B1F44',
    textAlign: 'center',
    lineHeight: 18,
  },
});
