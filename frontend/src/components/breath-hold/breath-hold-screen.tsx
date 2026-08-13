import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui/app-foundation';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { appDataCache } from '@/lib/app-data-cache';
import {
  completeBreathHold,
  getBreathHoldHistory,
  getBreathHoldSummary,
  getBreathHoldTrend,
  leaveBreathHold,
  startBreathHold,
  type BreathHoldAttempt,
  type BreathHoldFeeling,
  type BreathHoldSummary,
  type BreathHoldTrendPoint,
} from '@/lib/breath-hold-api';
import { sessionStore } from '@/lib/session-store';

type Mode = 'entry' | 'settle' | 'hold' | 'result' | 'feel' | 'trend' | 'history';

const feelings: { value: BreathHoldFeeling; label: string; body: string }[] = [
  { value: 'easy', label: 'Easy', body: 'Calm and controlled' },
  { value: 'okay', label: 'Okay', body: 'Manageable today' },
  { value: 'hard', label: 'Hard', body: 'Took real effort' },
  { value: 'dizzy', label: 'Dizzy', body: 'I need to slow down' },
  { value: 'other', label: 'Other', body: 'Something else' },
];

function secondsLabel(value?: number | null) {
  const total = Math.max(0, Math.floor(value || 0));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function statusLabel(status: string) {
  if (status === 'in_progress') return 'Left open';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function BreathHoldScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('entry');
  const [summary, setSummary] = useState<BreathHoldSummary | null>(null);
  const [attempt, setAttempt] = useState<BreathHoldAttempt | null>(null);
  const [history, setHistory] = useState<BreathHoldAttempt[]>([]);
  const [trend, setTrend] = useState<BreathHoldTrendPoint[]>([]);
  const [settleCount, setSettleCount] = useState(3);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [feeling, setFeeling] = useState<BreathHoldFeeling>('okay');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = sessionStore.getToken();
  const averageHold = useMemo(() => {
    if (!trend.length) return 0;
    return Math.round(trend.reduce((sum, item) => sum + item.holdSeconds, 0) / trend.length);
  }, [trend]);

  const loadData = useCallback(async () => {
    if (!token) {
      router.replace('/welcome');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [summaryResult, historyResult, trendResult] = await Promise.all([
        getBreathHoldSummary(token),
        getBreathHoldHistory(token),
        getBreathHoldTrend(token),
      ]);
      setSummary(summaryResult.summary);
      setAttempt(summaryResult.summary.todayAttempt);
      setHistory(historyResult.history);
      setTrend(trendResult.trend);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load breath check.');
    } finally {
      setIsLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (mode !== 'settle') return undefined;
    setSettleCount(3);
    const timer = setInterval(() => {
      setSettleCount((value) => {
        if (value <= 1) {
          clearInterval(timer);
          setHoldSeconds(0);
          setMode('hold');
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'hold') return undefined;
    const timer = setInterval(() => setHoldSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [mode]);

  async function beginExercise() {
    if (!token) return;
    setIsSubmitting(true);
    setError('');
    try {
      const result = await startBreathHold(token);
      setSummary(result.summary);
      setAttempt(result.attempt);
      setMode(result.summary.todayStatus === 'completed' ? 'entry' : 'settle');
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start exercise.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markLeft(nextMode: Mode = 'entry') {
    if (!token || !attempt || attempt.status !== 'in_progress') {
      setMode(nextMode);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await leaveBreathHold(token, attempt.id);
      setSummary(result.summary);
      setAttempt(result.attempt);
      await loadData();
      setMode(nextMode);
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : 'Unable to record exit.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitCompletion() {
    if (!token || !attempt) return;
    setIsSubmitting(true);
    setError('');
    try {
      const result = await completeBreathHold(token, attempt.id, { holdSeconds, feeling, note });
      appDataCache.setProgress(result.progress);
      setSummary(result.summary);
      setAttempt(result.attempt);
      await loadData();
      setMode('entry');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save completion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading && !summary) {
    return <Screen centered><ThemedText type="headline" style={styles.centerText}>Loading breath check...</ThemedText></Screen>;
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => (mode === 'entry' ? router.back() : markLeft('entry'))} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.backText}>{mode === 'entry' ? '<' : 'Close'}</ThemedText>
          </Pressable>
          <ThemedText type="headline" style={styles.headerTitle}>Breath Check</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {error ? <View style={styles.errorCard}><ThemedText style={styles.errorText}>{error}</ThemedText><Button label="Try again" onPress={loadData} /></View> : null}
        {mode === 'entry' && summary ? <Entry summary={summary} onStart={beginExercise} onTrend={() => setMode('trend')} onHistory={() => setMode('history')} disabled={isSubmitting} /> : null}
        {mode === 'settle' ? <Settle count={settleCount} onCancel={() => markLeft('entry')} disabled={isSubmitting} /> : null}
        {mode === 'hold' ? <Hold seconds={holdSeconds} onStop={() => setMode('result')} /> : null}
        {mode === 'result' && summary ? <Result seconds={holdSeconds} best={summary.bestHoldSeconds} average={averageHold} onContinue={() => setMode('feel')} onRetry={beginExercise} disabled={isSubmitting} /> : null}
        {mode === 'feel' ? <Feel selected={feeling} note={note} onSelect={setFeeling} onNote={setNote} onSubmit={submitCompletion} disabled={isSubmitting} /> : null}
        {mode === 'trend' && summary ? <Trend summary={summary} trend={trend} onBack={() => setMode('entry')} /> : null}
        {mode === 'history' ? <History history={history} onBack={() => setMode('entry')} /> : null}
      </ScrollView>
    </Screen>
  );
}

function Entry({ summary, onStart, onTrend, onHistory, disabled }: { summary: BreathHoldSummary; onStart: () => void; onTrend: () => void; onHistory: () => void; disabled: boolean }) {
  const isCompleted = summary.todayStatus === 'completed';
  return <View style={styles.stack}>
    <View style={styles.heroCard}><ThemedText style={styles.kicker}>Today</ThemedText><ThemedText type="title" style={styles.heroNumber}>{summary.currentStreak}</ThemedText><ThemedText type="headline" style={styles.heroTitle}>Day breath hold streak</ThemedText><ThemedText type="small" style={styles.heroBody}>{isCompleted ? 'Exercise completed for today.' : 'Finish one calm breath hold to grow your streak.'}</ThemedText></View>
    <View style={styles.statsRow}><Stat label="Last hold" value={secondsLabel(summary.lastHoldSeconds)} /><Stat label="Best hold" value={secondsLabel(summary.bestHoldSeconds)} /><Stat label="Completed" value={String(summary.completedCount)} /></View>
    <View style={styles.statusCard}><ThemedText type="smallBold">Today is {statusLabel(summary.todayStatus)}</ThemedText><ThemedText type="small" themeColor="textSecondary">Missed: {summary.missedCount} | Left: {summary.leftCount}</ThemedText></View>
    <Button label={isCompleted ? 'Done for today' : 'Start exercise'} onPress={onStart} disabled={disabled || isCompleted} />
    <View style={styles.splitRow}><Button label="Trend" variant="secondary" onPress={onTrend} /><Button label="History" variant="secondary" onPress={onHistory} /></View>
  </View>;
}

function Settle({ count, onCancel, disabled }: { count: number; onCancel: () => void; disabled: boolean }) {
  return <View style={styles.focusCard}><ThemedText style={styles.kicker}>Settle</ThemedText><ThemedText type="title" style={styles.timer}>{count}</ThemedText><ThemedText type="headline" style={styles.focusTitle}>Relax your shoulders</ThemedText><ThemedText style={styles.focusBody}>Breathe normally. When the timer finishes, take a comfortable inhale and hold.</ThemedText><Button label="Cancel" variant="secondary" onPress={onCancel} disabled={disabled} /></View>;
}

function Hold({ seconds, onStop }: { seconds: number; onStop: () => void }) {
  return <View style={styles.focusCard}><ThemedText style={styles.kicker}>Hold</ThemedText><ThemedText type="title" style={styles.timer}>{secondsLabel(seconds)}</ThemedText><ThemedText type="headline" style={styles.focusTitle}>Stop when your body asks</ThemedText><ThemedText style={styles.focusBody}>This is a check-in, not a challenge. Release gently when you are ready.</ThemedText><Button label="Release" onPress={onStop} /></View>;
}

function Result({ seconds, best, average, onContinue, onRetry, disabled }: { seconds: number; best: number; average: number; onContinue: () => void; onRetry: () => void; disabled: boolean }) {
  return <View style={styles.stack}><View style={styles.heroCard}><ThemedText style={styles.kicker}>Result</ThemedText><ThemedText type="title" style={styles.heroNumber}>{secondsLabel(seconds)}</ThemedText><ThemedText type="headline" style={styles.heroTitle}>Breath hold recorded</ThemedText><ThemedText type="small" style={styles.heroBody}>Best: {secondsLabel(best)} | Average: {secondsLabel(average)}</ThemedText></View><Button label="Continue" onPress={onContinue} disabled={disabled} /><Button label="Try again" variant="secondary" onPress={onRetry} disabled={disabled} /></View>;
}

function Feel({ selected, note, onSelect, onNote, onSubmit, disabled }: { selected: BreathHoldFeeling; note: string; onSelect: (value: BreathHoldFeeling) => void; onNote: (value: string) => void; onSubmit: () => void; disabled: boolean }) {
  return <View style={styles.stack}><ThemedText type="headline" style={styles.sectionTitle}>How did that feel?</ThemedText><View style={styles.optionGrid}>{feelings.map((item) => <Pressable key={item.value} onPress={() => onSelect(item.value)} style={({ pressed }) => [styles.option, selected === item.value && styles.optionActive, pressed && styles.pressed]}><ThemedText type="smallBold" style={styles.optionTitle}>{item.label}</ThemedText><ThemedText style={styles.optionBody}>{item.body}</ThemedText></Pressable>)}</View>{selected === 'dizzy' ? <ThemedText style={styles.safetyText}>Take it easier next time and stop as soon as you feel uncomfortable.</ThemedText> : null}<TextInput value={note} onChangeText={onNote} placeholder="Optional note" placeholderTextColor="#64748B" style={styles.input} multiline /><Button label="Complete exercise" onPress={onSubmit} disabled={disabled} /></View>;
}

function Trend({ summary, trend, onBack }: { summary: BreathHoldSummary; trend: BreathHoldTrendPoint[]; onBack: () => void }) {
  const max = Math.max(1, ...trend.map((item) => item.holdSeconds));
  return <View style={styles.stack}><ThemedText type="headline" style={styles.sectionTitle}>Breath check trend</ThemedText><View style={styles.statsRow}><Stat label="Streak" value={`${summary.currentStreak}`} /><Stat label="Best" value={secondsLabel(summary.bestHoldSeconds)} /><Stat label="Last" value={secondsLabel(summary.lastHoldSeconds)} /></View><View style={styles.chart}>{trend.length ? trend.map((item) => <View key={item.localDate} style={styles.barWrap}><View style={[styles.bar, { height: 24 + (item.holdSeconds / max) * 110 }]} /><ThemedText style={styles.axis}>{dateLabel(item.localDate)}</ThemedText></View>) : <ThemedText style={styles.empty}>Complete an exercise to build your trend.</ThemedText>}</View><Button label="Back" variant="secondary" onPress={onBack} /></View>;
}

function History({ history, onBack }: { history: BreathHoldAttempt[]; onBack: () => void }) {
  return <View style={styles.stack}><ThemedText type="headline" style={styles.sectionTitle}>History</ThemedText>{history.length ? history.map((item) => <View key={item.id} style={styles.historyRow}><View><ThemedText type="smallBold">{dateLabel(item.localDate)}</ThemedText><ThemedText style={styles.historyStatus}>{statusLabel(item.status)}{item.feeling ? ` | ${item.feeling}` : ''}</ThemedText></View><ThemedText type="headline" style={styles.historyValue}>{item.status === 'completed' ? secondsLabel(item.holdSeconds) : '-'}</ThemedText></View>) : <ThemedText style={styles.empty}>No breath checks yet.</ThemedText>}<Button label="Back" variant="secondary" onPress={onBack} /></View>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><ThemedText type="headline" style={styles.statValue}>{value}</ThemedText><ThemedText style={styles.statLabel}>{label}</ThemedText></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  content: { gap: Spacing.three, paddingBottom: Spacing.five },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minWidth: 52, minHeight: 38, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5FF' },
  backText: { color: '#3B82F6' },
  headerTitle: { color: '#1E293B' },
  headerSpacer: { width: 52 },
  stack: { gap: Spacing.three },
  heroCard: { minHeight: 226, borderRadius: 22, backgroundColor: '#1E293B', padding: Spacing.four, justifyContent: 'center', gap: Spacing.two, ...Shadow.soft },
  kicker: { color: '#22C55E', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  heroNumber: { color: '#FFFFFF', fontSize: 72, lineHeight: 78 },
  heroTitle: { color: '#FFFFFF', fontSize: 22 },
  heroBody: { color: '#EAF5FF', lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1, minHeight: 88, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: Spacing.two, ...Shadow.soft },
  statValue: { color: '#3B82F6', fontSize: 23 },
  statLabel: { color: '#64748B', fontSize: 11, textAlign: 'center' },
  statusCard: { borderRadius: Radius.medium, backgroundColor: '#EAF5FF', padding: Spacing.three, gap: Spacing.one },
  splitRow: { flexDirection: 'row', gap: Spacing.two },
  focusCard: { minHeight: 520, borderRadius: 24, backgroundColor: '#EAF5FF', padding: Spacing.four, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, ...Shadow.soft },
  timer: { color: '#3B82F6', fontSize: 82, lineHeight: 88, textAlign: 'center' },
  focusTitle: { color: '#1E293B', textAlign: 'center' },
  focusBody: { color: '#64748B', textAlign: 'center', lineHeight: 21 },
  sectionTitle: { color: '#1E293B', fontSize: 24 },
  optionGrid: { gap: Spacing.two },
  option: { minHeight: 70, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#EAF5FF', backgroundColor: '#FFFFFF', padding: Spacing.three, ...Shadow.soft },
  optionActive: { borderColor: '#3B82F6', backgroundColor: '#EAF5FF' },
  optionTitle: { color: '#1E293B' },
  optionBody: { color: '#64748B', fontSize: 12 },
  input: { minHeight: 86, borderRadius: Radius.medium, borderWidth: 1, borderColor: '#EAF5FF', padding: Spacing.three, color: '#1E293B', textAlignVertical: 'top' },
  safetyText: { color: '#64748B', backgroundColor: '#EAF5FF', borderRadius: Radius.medium, padding: Spacing.three, lineHeight: 19 },
  chart: { minHeight: 190, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: Spacing.three, ...Shadow.soft },
  barWrap: { flex: 1, alignItems: 'center', gap: Spacing.one },
  bar: { width: 14, borderRadius: 7, backgroundColor: '#3B82F6' },
  axis: { color: '#64748B', fontSize: 8, transform: [{ rotate: '-30deg' }] },
  historyRow: { minHeight: 72, borderRadius: Radius.medium, backgroundColor: '#FFFFFF', padding: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadow.soft },
  historyStatus: { color: '#64748B', fontSize: 12 },
  historyValue: { color: '#3B82F6' },
  empty: { color: '#64748B', textAlign: 'center', alignSelf: 'center' },
  errorCard: { gap: Spacing.two, borderWidth: 1, borderColor: '#FECACA', borderRadius: Radius.medium, backgroundColor: '#FFF7F7', padding: Spacing.three },
  errorText: { color: '#DC2626', textAlign: 'center' },
  centerText: { textAlign: 'center' },
  pressed: { opacity: 0.75 },
});
