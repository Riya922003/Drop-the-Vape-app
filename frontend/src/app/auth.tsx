import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppTextInput, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { appDataCache } from '@/lib/app-data-cache';
import { login, signUp } from '@/lib/auth-api';
import { getProgress } from '@/lib/progress-api';
import { getQuitProfile } from '@/lib/quit-profile-api';
import { sessionStore } from '@/lib/session-store';

type AuthMode = 'signup' | 'login';
type AuthStep = 'choice' | 'email';

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function AuthRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = params.mode === 'login' ? 'login' : 'signup';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>(initialMode === 'login' ? 'email' : 'choice');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const copy = useMemo(() => {
    if (mode === 'signup') {
      return {
        title: 'Create your account',
        description: 'Save your quit plan, progress, savings, and milestones securely.',
        submit: 'Create Account',
        switchPrompt: 'Already have an account?',
        switchLabel: 'Sign in',
      };
    }

    return {
      title: 'Sign in to continue',
      description: 'Pick up your quit journey exactly where you left off.',
      submit: 'Sign In',
      switchPrompt: 'New to Drop Vape?',
      switchLabel: 'Create account',
    };
  }, [mode]);

  function goBack() {
    if (step === 'email' && mode === 'signup') {
      setStep('choice');
      setError('');
      return;
    }
    router.back();
  }

  function validateForm() {
    if (mode === 'signup' && name.trim().length < 2) return 'Enter your name.';
    if (!isEmail(email)) return 'Enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  async function routeAfterAuth(token: string) {
    try {
      const [profileResult, progressResult] = await Promise.all([getQuitProfile(token), getProgress(token)]);
      appDataCache.setQuitProfile(profileResult.quitProfile);
      appDataCache.setProgress(progressResult.progress);
      router.replace('/home');
    } catch {
      router.replace('/setup');
    }
  }

  async function submit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const result =
        mode === 'signup'
          ? await signUp({ name: name.trim(), email: email.trim(), password })
          : await login({ email: email.trim(), password });

      sessionStore.setToken(result.token);
      sessionStore.setUser(result.user);
      await routeAfterAuth(result.token);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode() {
    setError('');
    setMode((current) => (current === 'signup' ? 'login' : 'signup'));
    setStep('email');
  }

  function unavailable(provider: string) {
    setError(`${provider} sign in is not connected yet. Continue with email for now.`);
  }

  function renderBrand() {
    return (
      <View style={styles.brandBlock}>
        <Image source={require('@/assets/drop-the-vape/logo.png')} style={styles.logoImage} contentFit="contain" />
        <ThemedText type="smallBold" style={styles.logoText}>Drop Vape</ThemedText>
      </View>
    );
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <Pressable onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ThemedText type="headline" style={styles.backIcon}>{'<'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderBrand()}

          <View style={step === 'choice' ? styles.heroFrame : styles.formHeroFrame}>
            <Image source={require('@/assets/drop-the-vape/sign-up.png')} style={styles.artwork} contentFit="contain" />
          </View>

          {step === 'choice' ? (
            <>
              <View style={styles.copy}>
                <ThemedText type="title" style={styles.welcomeTitle}>Welcome!</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.welcomeDescription}>
                  Let&apos;s continue your journey to a vape-free life.
                </ThemedText>
              </View>

              <View style={styles.socialStack}>
                <AuthChoiceButton icon="G" label="Continue with Google" onPress={() => unavailable('Google')} />
                <AuthChoiceButton icon="A" label="Continue with Apple" onPress={() => unavailable('Apple')} />
                <AuthChoiceButton icon="@" label="Continue with Email" onPress={() => setStep('email')} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.copy}>
                <ThemedText type="subtitle" style={styles.formTitle}>{copy.title}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.formDescription}>{copy.description}</ThemedText>
              </View>

              <View style={styles.formCard}>
                {mode === 'signup' ? <AppTextInput label="Name" value={name} onChangeText={setName} placeholder="Your name" textContentType="name" /> : null}
                <AppTextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
                <AppTextInput label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry textContentType={mode === 'signup' ? 'newPassword' : 'password'} />
              </View>
            </>
          )}

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </ScrollView>

        {step === 'email' ? (
          <View style={styles.actions}>
            <Pressable disabled={isLoading} onPress={submit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isLoading && styles.disabled]}>
              <ThemedText type="headline" style={styles.primaryButtonText}>{isLoading ? 'Please wait...' : copy.submit}</ThemedText>
            </Pressable>

            <View style={styles.switchRow}>
              <ThemedText type="small" themeColor="textSecondary">{copy.switchPrompt}</ThemedText>
              <Pressable disabled={isLoading} onPress={switchMode} style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="smallBold" style={styles.switchLink}>{copy.switchLabel}</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.footerNote}>
            <View style={styles.footerLine} />
            <View style={styles.lockBadge}><ThemedText style={styles.lockText}>lock</ThemedText></View>
            <View style={styles.footerLine} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.footerCopy}>Save your progress across devices.</ThemedText>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function AuthChoiceButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.choiceButton, pressed && styles.pressed]}>
      <ThemedText type="headline" style={[styles.choiceIcon, icon === 'G' && styles.googleIcon]}>{icon}</ThemedText>
      <ThemedText type="headline" style={styles.choiceLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  backButton: { position: 'absolute', left: Spacing.two, top: Spacing.two, zIndex: 2, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#1E293B', fontSize: 24 },
  content: { gap: Spacing.three, paddingBottom: Spacing.three, paddingTop: Spacing.one },
  brandBlock: { alignItems: 'center', gap: Spacing.one },
  logoImage: { width: 48, height: 48 },
  logoText: { color: '#1E293B', fontSize: 18, lineHeight: 24 },
  heroFrame: { height: 286, marginTop: Spacing.one, overflow: 'hidden' },
  formHeroFrame: { height: 210, overflow: 'hidden' },
  artwork: { width: '100%', height: '100%' },
  copy: { alignItems: 'center', gap: Spacing.one },
  welcomeTitle: { color: '#1E293B', fontSize: 36, lineHeight: 42, textAlign: 'center' },
  welcomeDescription: { maxWidth: 250, textAlign: 'center', lineHeight: 22 },
  socialStack: { gap: Spacing.two, marginTop: Spacing.one },
  choiceButton: { minHeight: 58, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.four, ...Shadow.soft },
  choiceIcon: { width: 34, color: '#1E293B', textAlign: 'center', fontSize: 22 },
  googleIcon: { color: '#3B82F6' },
  choiceLabel: { flex: 1, color: '#1E293B', fontSize: 17, textAlign: 'center' },
  formTitle: { maxWidth: 340, color: '#1E293B', textAlign: 'center' },
  formDescription: { maxWidth: 310, textAlign: 'center', lineHeight: 22 },
  formCard: { gap: Spacing.three, borderWidth: 1, borderColor: '#EAF5FF', borderRadius: Radius.large, backgroundColor: '#FFFFFF', padding: Spacing.three, ...Shadow.soft },
  error: { color: '#DC2626', textAlign: 'center' },
  actions: { gap: Spacing.two, paddingTop: Spacing.two },
  primaryButton: { minHeight: 56, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', ...Shadow.soft },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, lineHeight: 24 },
  switchRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  switchLink: { color: '#3B82F6' },
  footerNote: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingBottom: Spacing.one },
  footerLine: { width: 134, height: 1, backgroundColor: '#EAF5FF' },
  lockBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5FF' },
  lockText: { color: '#3B82F6', fontSize: 10 },
  footerCopy: { width: '100%', textAlign: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
