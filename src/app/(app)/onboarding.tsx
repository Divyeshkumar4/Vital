import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SegmentedChoice } from '@/components/SegmentedChoice';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { t } from '@/i18n/strings';
import { ftInToCm, kgToLb, lbToKg, cmToFtIn } from '@/i18n/units';
import { currencyForRegion, detectRegion } from '@/lib/locale/region';
import { compute } from '@/lib/science';
import type {
  ActivityLevel,
  DietPattern,
  Goal,
  Persona,
  Sex,
} from '@/lib/science';
import type { UnitPreference } from '@/features/profile/types';

interface FormState {
  name: string;
  ageStr: string;
  sex: Sex | null;
  units: UnitPreference;
  weightStr: string;
  heightCmStr: string;
  heightFtStr: string;
  heightInStr: string;
  bodyFatStr: string;
  activity: ActivityLevel | null;
  persona: Persona;
  endurance: boolean;
  diet: DietPattern;
  excludesEggs: boolean;
  goal: Goal | null;
  region: string; // ISO 3166-1 alpha-2 or 'GLOBAL'
  currency: string; // ISO 4217
}

const REGION_OPTIONS: { value: string; label: string }[] = [
  { value: 'US', label: 'United States · USD' },
  { value: 'IN', label: 'India · INR' },
  { value: 'GB', label: 'United Kingdom · GBP' },
  { value: 'CA', label: 'Canada · CAD' },
  { value: 'AU', label: 'Australia · AUD' },
  { value: 'EU', label: 'Eurozone · EUR' },
  { value: 'GLOBAL', label: 'Other / Global' },
];

function defaultForm(): FormState {
  const region = detectRegion() ?? 'GLOBAL';
  return {
    name: '',
    ageStr: '',
    sex: null,
    units: 'metric',
    weightStr: '',
    heightCmStr: '',
    heightFtStr: '',
    heightInStr: '',
    bodyFatStr: '',
    activity: null,
    persona: 'general',
    endurance: false,
    diet: 'omnivore',
    excludesEggs: false,
    goal: null,
    region,
    currency: currencyForRegion(region),
  };
}

const emptyForm: FormState = defaultForm();

function parseHeightCm(form: FormState): number | null {
  if (form.units === 'metric') {
    const v = parseFloat(form.heightCmStr);
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  const ft = parseFloat(form.heightFtStr) || 0;
  const inches = parseFloat(form.heightInStr) || 0;
  if (ft === 0 && inches === 0) return null;
  return ftInToCm(ft, inches);
}

function parseWeightKg(form: FormState): number | null {
  const v = parseFloat(form.weightStr);
  if (!Number.isFinite(v) || v <= 0) return null;
  return form.units === 'metric' ? v : lbToKg(v);
}

export default function Onboarding() {
  const user = useAuth((s) => s.user);
  const { profile, save, loading, error: profileError } = useProfile();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hydrate the form from the existing profile if there is one (re-onboarding flow).
  useEffect(() => {
    if (!profile) return;
    const units = profile.unitPreference;
    let weightStr = '';
    if (profile.weightKg !== null) {
      const v = units === 'metric' ? profile.weightKg : kgToLb(profile.weightKg);
      weightStr = v.toFixed(1).replace(/\.0$/, '');
    }
    let heightCmStr = '';
    let heightFtStr = '';
    let heightInStr = '';
    if (profile.heightCm !== null) {
      if (units === 'metric') {
        heightCmStr = profile.heightCm.toString();
      } else {
        const { feet, inches } = cmToFtIn(profile.heightCm);
        heightFtStr = String(feet);
        heightInStr = inches.toFixed(0);
      }
    }
    const region = profile.region ?? detectRegion() ?? 'GLOBAL';
    setForm({
      name: profile.name ?? '',
      ageStr: profile.age?.toString() ?? '',
      sex: profile.sex,
      units,
      weightStr,
      heightCmStr,
      heightFtStr,
      heightInStr,
      bodyFatStr: profile.bodyFatPct?.toString() ?? '',
      activity: profile.activityLevel,
      persona: profile.persona,
      endurance: profile.endurance,
      diet: profile.dietPattern,
      excludesEggs: profile.excludesEggs ?? false,
      goal: profile.goal,
      region,
      currency: profile.currency ?? currencyForRegion(region),
    });
  }, [profile]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setValidationError(null);
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }
    const age = parseInt(form.ageStr, 10);
    if (!Number.isFinite(age) || age < 18 || age > 120) {
      setValidationError(t('onboarding.errors.ageRange'));
      return;
    }
    if (!form.sex) {
      setValidationError(t('onboarding.errors.required'));
      return;
    }
    const weightKg = parseWeightKg(form);
    if (weightKg === null) {
      setValidationError(t('onboarding.errors.weight'));
      return;
    }
    const heightCm = parseHeightCm(form);
    if (heightCm === null) {
      setValidationError(t('onboarding.errors.height'));
      return;
    }
    if (!form.activity || !form.goal) {
      setValidationError(t('onboarding.errors.required'));
      return;
    }

    let bodyFatPct: number | null = null;
    if (form.bodyFatStr.trim() !== '') {
      const v = parseFloat(form.bodyFatStr);
      if (Number.isFinite(v) && v >= 3 && v <= 60) bodyFatPct = v;
    }

    // Compute targets so we can snapshot them onto the profile row.
    const result = compute({
      weightKg,
      heightCm,
      age,
      sex: form.sex,
      activity: form.activity,
      goal: form.goal,
      persona: form.persona,
      endurance: form.endurance,
      bodyFatPct,
      dietPattern: form.diet,
      deficitPct: form.goal === 'lose' ? undefined : undefined,
      surplusPct: form.goal === 'gain' ? undefined : undefined,
    });
    // For lose/gain we need a default percent — we pass through matrix defaults below.
    // Re-compute with matrix-default percentages if needed.
    const finalResult = (() => {
      if (result.ok) return result;
      // Resolve matrix default percent and retry once.
      // (compute requires a pct for lose/gain; this is the safety net.)
      const fallbackPct = form.goal === 'lose' ? 20 : 10;
      return compute({
        weightKg,
        heightCm,
        age,
        sex: form.sex,
        activity: form.activity,
        goal: form.goal,
        persona: form.persona,
        endurance: form.endurance,
        bodyFatPct,
        dietPattern: form.diet,
        deficitPct: form.goal === 'lose' ? fallbackPct : undefined,
        surplusPct: form.goal === 'gain' ? fallbackPct : undefined,
      });
    })();

    if (!finalResult.ok) {
      setValidationError(finalResult.message);
      return;
    }

    setSubmitting(true);
    try {
      await save(user.id, {
        name: form.name.trim() || null,
        age,
        sex: form.sex,
        unitPreference: form.units,
        heightCm,
        weightKg,
        bodyFatPct,
        activityLevel: form.activity,
        goal: form.goal,
        persona: form.persona,
        endurance: form.endurance,
        dietPattern: form.diet,
        excludesEggs: form.diet === 'vegetarian' ? form.excludesEggs : false,
        region: form.region,
        currency: form.currency,
        deficitPct: form.goal === 'lose' ? 20 : null,
        surplusPct: form.goal === 'gain' ? 10 : null,
        targetCalories: Math.round(finalResult.value.finalCalories),
        targetProteinG: Math.round(finalResult.value.protein.g),
        targetFatG: Math.round(finalResult.value.fat.g),
        targetCarbsG: Math.round(finalResult.value.carb.g),
        targetFiberG: Math.round(finalResult.value.fiberG),
        methodologyVersion: finalResult.value.methodologyVersion,
      });
      router.replace('/(app)/(tabs)/home');
    } catch (e) {
      setValidationError(e instanceof Error ? e.message : t('onboarding.errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const isMetric = form.units === 'metric';

  return (
    <Screen scroll className="gap-6">
      <View className="gap-2 mt-4">
        <Text variant="display">{t('onboarding.title')}</Text>
        <Text variant="caption">{t('onboarding.subtitle')}</Text>
      </View>

      <Input
        label={t('onboarding.name')}
        value={form.name}
        onChangeText={(v) => setField('name', v)}
        placeholder={t('onboarding.namePlaceholder')}
        autoCapitalize="words"
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <NumberField
            label={t('onboarding.age')}
            value={form.ageStr}
            onChangeText={(v) => setField('ageStr', v)}
            mode="integer"
            placeholder="30"
          />
        </View>
      </View>

      <SegmentedChoice
        label={t('onboarding.sex')}
        value={form.sex}
        onChange={(v) => setField('sex', v)}
        options={[
          { value: 'male', label: t('onboarding.male') },
          { value: 'female', label: t('onboarding.female') },
          { value: 'nb', label: t('onboarding.nb') },
        ]}
      />

      <SegmentedChoice
        label={t('onboarding.units')}
        value={form.units}
        onChange={(v) => setField('units', v)}
        options={[
          { value: 'metric', label: t('onboarding.metric') },
          { value: 'imperial', label: t('onboarding.imperial') },
        ]}
      />

      <NumberField
        label={`${t('onboarding.weight')} (${isMetric ? 'kg' : 'lb'})`}
        value={form.weightStr}
        onChangeText={(v) => setField('weightStr', v)}
        mode="decimal"
        suffix={isMetric ? 'kg' : 'lb'}
        placeholder={isMetric ? '70' : '154'}
      />

      {isMetric ? (
        <NumberField
          label={`${t('onboarding.height')} (cm)`}
          value={form.heightCmStr}
          onChangeText={(v) => setField('heightCmStr', v)}
          mode="integer"
          suffix="cm"
          placeholder="175"
        />
      ) : (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <NumberField
              label={t('onboarding.heightFeet')}
              value={form.heightFtStr}
              onChangeText={(v) => setField('heightFtStr', v)}
              mode="integer"
              suffix="ft"
              placeholder="5"
            />
          </View>
          <View className="flex-1">
            <NumberField
              label={t('onboarding.heightInches')}
              value={form.heightInStr}
              onChangeText={(v) => setField('heightInStr', v)}
              mode="integer"
              suffix="in"
              placeholder="9"
            />
          </View>
        </View>
      )}

      <NumberField
        label={`${t('onboarding.bodyFat')} (${t('common.optional')})`}
        value={form.bodyFatStr}
        onChangeText={(v) => setField('bodyFatStr', v)}
        mode="decimal"
        suffix="%"
        placeholder="—"
      />
      <Text variant="caption">{t('onboarding.bodyFatHelp')}</Text>

      <SegmentedChoice
        label={t('onboarding.activity')}
        value={form.activity}
        onChange={(v) => setField('activity', v)}
        vertical
        options={[
          { value: 'sedentary', label: t('onboarding.activitySedentary') },
          { value: 'light', label: t('onboarding.activityLight') },
          { value: 'moderate', label: t('onboarding.activityModerate') },
          { value: 'very', label: t('onboarding.activityVery') },
          { value: 'extra', label: t('onboarding.activityExtra') },
        ]}
      />

      <SegmentedChoice
        label={t('onboarding.persona')}
        value={form.persona}
        onChange={(v) => setField('persona', v)}
        vertical
        options={[
          { value: 'training', label: t('onboarding.personaTraining') },
          { value: 'general', label: t('onboarding.personaGeneral') },
        ]}
      />

      <SegmentedChoice
        label={t('onboarding.endurance')}
        value={form.endurance ? 'yes' : 'no'}
        onChange={(v) => setField('endurance', v === 'yes')}
        options={[
          { value: 'no', label: t('common.no') },
          { value: 'yes', label: t('common.yes') },
        ]}
      />

      <SegmentedChoice
        label={t('onboarding.diet')}
        value={form.diet}
        onChange={(v) => setField('diet', v)}
        options={[
          { value: 'omnivore', label: t('onboarding.dietOmnivore') },
          { value: 'vegetarian', label: t('onboarding.dietVegetarian') },
          { value: 'vegan', label: t('onboarding.dietVegan') },
        ]}
      />

      {form.diet === 'vegetarian' ? (
        <SegmentedChoice
          label={t('onboarding.eggsQ')}
          value={form.excludesEggs ? 'no' : 'yes'}
          onChange={(v) => setField('excludesEggs', v === 'no')}
          options={[
            { value: 'yes', label: t('onboarding.eggsYes') },
            { value: 'no', label: t('onboarding.eggsNo') },
          ]}
        />
      ) : null}

      <SegmentedChoice
        label={t('cost.region')}
        value={form.region}
        onChange={(v) => {
          setField('region', v);
          setField('currency', currencyForRegion(v === 'EU' ? 'DE' : v === 'GLOBAL' ? null : v));
        }}
        vertical
        options={REGION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
      <Text variant="caption" className="text-fg-subtle">
        {t('cost.regionHelp')}
      </Text>

      <SegmentedChoice
        label={t('onboarding.goal')}
        value={form.goal}
        onChange={(v) => setField('goal', v)}
        vertical
        options={[
          { value: 'lose', label: t('onboarding.goalLose') },
          { value: 'maintain', label: t('onboarding.goalMaintain') },
          { value: 'gain', label: t('onboarding.goalGain') },
        ]}
      />

      {validationError ? (
        <Text variant="caption" className="text-danger">
          {validationError}
        </Text>
      ) : null}
      {profileError ? (
        <Text variant="caption" className="text-danger">
          {profileError}
        </Text>
      ) : null}

      <Button
        title={t('onboarding.submit')}
        onPress={onSubmit}
        loading={submitting || loading}
        className="mt-2 mb-8"
      />
    </Screen>
  );
}
