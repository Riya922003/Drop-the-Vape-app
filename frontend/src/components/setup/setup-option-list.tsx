import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';

type SetupOption = {
  title: string;
  value: string;
};

type SetupOptionListProps = {
  options: SetupOption[];
  value: string;
  onChange: (value: string) => void;
};

function getHistoryIcon(value: string) {
  switch (value) {
    case 'under_1_month':
      return 'M';
    case '1_to_6_months':
      return '6';
    case '6_to_12_months':
      return 'Y';
    case '1_to_2_years':
      return '2';
    default:
      return 'Y+';
  }
}

export function SetupOptionList({ options, value, onChange }: SetupOptionListProps) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.pressable}>
            <View style={[styles.row, selected && styles.rowSelected]}>
              <View style={styles.iconWrap}>
                <ThemedText type="smallBold" style={styles.iconText}>
                  {getHistoryIcon(option.value)}
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
  list: {
    gap: Spacing.two,
  },
  pressable: {
    borderRadius: Radius.medium,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: '#DDEAF7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    ...Shadow.soft,
  },
  rowSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FBFF',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F1FF',
  },
  iconText: {
    color: '#3B82F6',
  },
  title: {
    flex: 1,
    color: '#0B1F44',
  },
});
