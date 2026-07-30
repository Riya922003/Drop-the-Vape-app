import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <Screen style={styles.screen}>
      <View style={styles.artworkFrame}>
        <Image source={require('@/assets/drop-the-vape/welcome/1-image.png')} style={styles.artwork} contentFit="contain" />
      </View>

      <View style={styles.copyBlock}>
        <ThemedText type="subtitle" style={styles.title}>
          Ready to Drop the Vape?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Create your account first so your quit plan, progress, savings, and milestones stay saved.
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <ThemedText type="headline" style={styles.primaryButtonText}>
            Create Account -&gt;
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.secondaryButtonText}>
            I already have an account
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
    overflow: 'hidden',
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
    maxWidth: 335,
    textAlign: 'center',
    lineHeight: 22,
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
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
  },
  pressed: {
    opacity: 0.75,
  },
});
