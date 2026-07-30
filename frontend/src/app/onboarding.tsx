import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { sessionStore } from '@/lib/session-store';

const STEPS = [
  {
    title: 'Every Vape-Free Day Changes Your Life',
    description: 'Quit vaping one day at a time.\nTrack your progress, celebrate every milestone, and watch your body recover with every vape-free moment.',
    image: require('@/assets/drop-the-vape/onboarding/1.png'),
  },
  {
    title: 'See Your Progress Build Daily',
    description: 'Follow your streak, money saved, and vapes avoided as every small choice turns into visible progress.',
    image: require('@/assets/drop-the-vape/onboarding/2.png'),
  },
  {
    title: 'Your Journey Starts Today',
    description: 'Set your quit goal, keep moving forward, and let each milestone remind you why you started.',
    image: require('@/assets/drop-the-vape/onboarding/3.png'),
  },
];

export default function OnboardingRoute() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLastStep = index === STEPS.length - 1;

  function finishOnboarding() {
    sessionStore.setOnboardingComplete();
    router.replace('/welcome');
  }

  function continueFlow() {
    if (!isLastStep) {
      setIndex((current) => current + 1);
      return;
    }

    finishOnboarding();
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.artworkFrame}>
        <Image source={step.image} style={styles.artwork} contentFit="cover" />
      </View>

      <View style={styles.copyBlock}>
        <ThemedText type="subtitle" style={styles.title}>
          {step.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          {step.description}
        </ThemedText>
      </View>

      <View style={styles.progressRow}>
        {STEPS.map((item, itemIndex) => (
          <View
            key={item.title}
            style={[styles.progressDot, itemIndex === index ? styles.progressDotActive : null]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={continueFlow} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <ThemedText type="headline" style={styles.primaryButtonText}>
            {isLastStep ? 'Get Started ->' : 'Continue ->'}
          </ThemedText>
        </Pressable>

        <Pressable onPress={finishOnboarding} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Skip
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  artworkFrame: {
    flex: 1,
    minHeight: 360,
    borderRadius: Radius.large,
    overflow: 'hidden',
    backgroundColor: '#EAF5FF',
    ...Shadow.soft,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  copyBlock: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
  },
  title: {
    maxWidth: 340,
    textAlign: 'center',
    color: '#1E293B',
  },
  description: {
    maxWidth: 330,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  progressDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EAF5FF',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
  },
  actions: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
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
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
