import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { SegmentedChoice } from '@/components/SegmentedChoice';
import { useAuth } from '@/store/auth';
import { createRoutineFromDraft } from '@/features/workout/queries';
import { generateRoutine } from '@/features/workout/generator';
import type { Experience } from '@/features/workout/types';
import type { TrainingGoal } from '@/lib/science/workout';
import { t } from '@/i18n/strings';

export default function WorkoutSetup() {
  const user = useAuth((s) => s.user);
  const [experience, setExperience] = useState<Experience>('beginner');
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const draft = generateRoutine(experience, goal);
      await createRoutineFromDraft(user.id, draft);
      router.replace('/(app)/(tabs)/workout');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-2">
        <Text variant="h1">{t('workout.setupTitle')}</Text>
        <Text variant="caption">{t('workout.setupSubtitle')}</Text>
      </View>

      <SegmentedChoice
        label={t('workout.experience')}
        value={experience}
        onChange={(v) => setExperience(v)}
        vertical
        options={[
          { value: 'beginner', label: t('workout.expBeginner') },
          { value: 'intermediate', label: t('workout.expIntermediate') },
          { value: 'advanced', label: t('workout.expAdvanced') },
        ]}
      />

      <SegmentedChoice
        label={t('workout.trainingGoal')}
        value={goal}
        onChange={(v) => setGoal(v)}
        vertical
        options={[
          { value: 'strength', label: t('workout.goalStrength') },
          { value: 'hypertrophy', label: t('workout.goalHypertrophy') },
          { value: 'endurance', label: t('workout.goalEndurance') },
        ]}
      />

      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}

      <Button title={t('workout.generate')} onPress={onGenerate} loading={submitting} />
      <Button title={t('common.cancel')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
