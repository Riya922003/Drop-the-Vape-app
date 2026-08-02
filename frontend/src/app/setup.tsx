import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QuitGoalStep } from '@/components/setup/quit-goal-step';
import { SetupOptionGrid } from '@/components/setup/reason-grid';
import { SetupOptionList } from '@/components/setup/setup-option-list';
import { SetupStepFrame } from '@/components/setup/setup-step-frame';
import { VapeLastsStep } from '@/components/setup/vape-lasts-step';
import { ThemedText } from '@/components/themed-text';
import { AppTextInput, Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { appDataCache } from '@/lib/app-data-cache';
import { getProgress } from '@/lib/progress-api';
import { createQuitProfile, type QuitProfileInput } from '@/lib/quit-profile-api';
import { EMPTY_DRAFT, SETUP_STEPS, type SetupDraft } from '@/lib/setup-steps';
import { sessionStore } from '@/lib/session-store';

function getInitialDraft() {
  const saved = sessionStore.getSetupDraft();

  if (!saved) {
    return EMPTY_DRAFT;
  }

  try {
    return { ...EMPTY_DRAFT, ...JSON.parse(saved) };
  } catch {
    return EMPTY_DRAFT;
  }
}

function toProfileInput(draft: SetupDraft): QuitProfileInput {
  return {
    quitReason: draft.quitReason,
    vapesPerWeek: Number(draft.vapesPerWeek),
    vapingHistory: draft.vapingHistory,
    costPerVape: Number(draft.costPerVape || '1'),
    daysPerVape: Number(draft.daysPerVape),
    quitGoal: draft.quitGoal,
  };
}

export default function SetupRoute() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(-1);
  const [draft, setDraft] = useState<SetupDraft>(getInitialDraft);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isIntroStep = stepIndex === -1;
  const step = isIntroStep ? undefined : SETUP_STEPS[stepIndex];
  const value = step ? draft[step.key] : '';
  const isReasonStep = step?.key === 'quitReason';
  const isFrequencyStep = step?.key === 'vapesPerWeek';
  const isHistoryStep = step?.key === 'vapingHistory';
  const isLastsStep = step?.key === 'daysPerVape';
  const isGoalStep = step?.key === 'quitGoal';
  const isReferenceCardStep = isReasonStep || isFrequencyStep || isHistoryStep || isGoalStep;
  const isLastStep = stepIndex === SETUP_STEPS.length - 1;

  const canContinue = useMemo(() => {
    if (isIntroStep) {
      return true;
    }

    if (!step || !value) {
      return false;
    }

    if (step.kind === 'number') {
      const number = Number(value);
      return Number.isFinite(number) && number > 0;
    }

    return true;
  }, [isIntroStep, step, value]);

  useEffect(() => {
    sessionStore.setSetupDraft(JSON.stringify(draft));
  }, [draft]);

  function updateValue(key: keyof SetupDraft, nextValue: string) {
    setError('');
    setDraft((current) => ({ ...current, [key]: nextValue }));
  }

  function goBack() {
    setError('');
    if (isIntroStep) {
      router.back();
      return;
    }

    setStepIndex((current) => current - 1);
  }

  function skipLastsStep() {
    updateValue('daysPerVape', '1');
    setStepIndex((current) => current + 1);
  }

  async function continueFlow() {
    if (isIntroStep) {
      setStepIndex(0);
      return;
    }

    if (!canContinue) {
      setError('Please choose an answer before continuing.');
      return;
    }

    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    const token = sessionStore.getToken();

    if (!token) {
      router.replace('/welcome');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const profileResult = await createQuitProfile(token, toProfileInput(draft));
      appDataCache.setQuitProfile(profileResult.quitProfile);
      const progressResult = await getProgress(token);
      appDataCache.setProgress(progressResult.progress);
      sessionStore.clearSetupDraft();
      router.replace('/home');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Please check your answers and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.topRow}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ThemedText type="headline" style={styles.backText}>
              &lt;
            </ThemedText>
          </Pressable>
          {!isIntroStep && !isReferenceCardStep && !isLastsStep ? (
            <ThemedText type="smallBold" themeColor="textSecondary">
              {stepIndex + 2} of {SETUP_STEPS.length + 1}
            </ThemedText>
          ) : null}
        </View>

        {!isIntroStep && !isReferenceCardStep && !isLastsStep ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((stepIndex + 2) / (SETUP_STEPS.length + 1)) * 100}%` }]} />
          </View>
        ) : null}

        <ScrollView contentContainerStyle={[styles.content, (isIntroStep || isReferenceCardStep || isLastsStep) && styles.referenceContent]} showsVerticalScrollIndicator={false}>
          {isIntroStep ? (
            <SetupStepFrame stepNumber={1} stepLabel="Step 1 of 5" activeDotIndex={0}>
              <View style={styles.copy}>
                <ThemedText type="subtitle" style={styles.introTitle}>
                  Let&apos;s Build{`\n`}Your Quit Plan
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.introDescription}>
                  Answer a few quick questions so we can personalize your journey and help you quit successfully.
                </ThemedText>
              </View>

              <View style={styles.introArtworkFrame}>
                <Image source={require('@/assets/drop-the-vape/welcome/1-image.png')} style={styles.introArtwork} contentFit="contain" />
              </View>
            </SetupStepFrame>
          ) : isReferenceCardStep && step ? (
            <SetupStepFrame
              stepNumber={isReasonStep ? 2 : isFrequencyStep ? 3 : isHistoryStep ? 4 : 5}
              stepLabel={isReasonStep ? 'Step 2 of 5' : isFrequencyStep ? 'Step 3 of 5' : isHistoryStep ? 'Step 4 of 5' : 'Step 5 of 5'}
              activeDotIndex={isReasonStep ? 1 : isFrequencyStep ? 2 : isHistoryStep ? 3 : 4}>
              {isGoalStep ? (
                <QuitGoalStep options={step.options ?? []} value={value} onChange={(nextValue) => updateValue(step.key, nextValue)} />
              ) : (
                <>
                  <View style={styles.copy}>
                    <ThemedText type="subtitle" style={styles.referenceTitle}>
                      {step.title}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.description}>
                      {step.description}
                    </ThemedText>
                  </View>

                  {isHistoryStep ? (
                    <SetupOptionList options={step.options ?? []} value={value} onChange={(nextValue) => updateValue(step.key, nextValue)} />
                  ) : (
                    <SetupOptionGrid options={step.options ?? []} value={value} onChange={(nextValue) => updateValue(step.key, nextValue)} />
                  )}
                </>
              )}
            </SetupStepFrame>
          ) : isLastsStep && step ? (
            <VapeLastsStep
              options={step.options ?? []}
              value={value}
              weeklyVapes={Number(draft.vapesPerWeek)}
              isLoading={isLoading}
              onChange={(nextValue) => updateValue(step.key, nextValue)}
              onContinue={continueFlow}
              onSkip={skipLastsStep}
            />
          ) : step ? (
            <>
              <View style={styles.brandBlock}>
                <Image source={require('@/assets/drop-the-vape/logo.png')} style={styles.logoImage} contentFit="contain" />
                <ThemedText type="smallBold" style={styles.logoText}>
                  Drop Vape
                </ThemedText>
              </View>

              <View style={styles.copy}>
                <ThemedText type="subtitle" style={styles.title}>
                  {step.title}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.description}>
                  {step.description}
                </ThemedText>
              </View>

              {step.kind === 'number' ? (
                <View style={styles.inputCard}>
                  <AppTextInput
                    label={step.inputLabel ?? 'Value'}
                    value={value}
                    onChangeText={(nextValue) => updateValue(step.key, nextValue)}
                    placeholder={step.inputPlaceholder}
                    keyboardType="decimal-pad"
                  />
                </View>
              ) : null}
            </>
          ) : null}

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </ScrollView>

        {!isLastsStep ? (
          <Button
            label={isLoading ? 'Saving...' : isIntroStep ? "Let's Go ->" : isGoalStep ? 'Continue ->' : isLastStep ? 'Finish setup' : 'Continue'}
            disabled={isLoading}
            onPress={continueFlow}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
    gap: Spacing.three,
  },
  topRow: {
    minHeight: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    minHeight: 36,
    minWidth: 36,
    justifyContent: 'center',
  },
  backText: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 24,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#EAF5FF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: '#3B82F6',
  },
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  referenceContent: {
    gap: Spacing.three,
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logoImage: { width: 44, height: 44 },
  logoText: {
    color: '#1E293B',
  },
  copy: {
    gap: Spacing.one,
    alignItems: 'center',
  },
  title: {
    maxWidth: 340,
    textAlign: 'center',
    color: '#1E293B',
  },
  introTitle: {
    maxWidth: 320,
    textAlign: 'center',
    color: '#1E293B',
    fontSize: 31,
    lineHeight: 35,
  },
  introDescription: {
    maxWidth: 275,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  referenceTitle: {
    maxWidth: 300,
    textAlign: 'center',
    color: '#1E293B',
    fontSize: 30,
    lineHeight: 34,
  },
  description: {
    maxWidth: 320,
    textAlign: 'center',
    lineHeight: 22,
  },
  introArtworkFrame: {
    minHeight: 300,
    maxHeight: 360,
    overflow: 'hidden',
  },
  introArtwork: {
    width: '100%',
    height: '100%',
  },
  inputCard: {
    borderRadius: Radius.large,
    padding: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAF5FF',
    ...Shadow.soft,
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
});
