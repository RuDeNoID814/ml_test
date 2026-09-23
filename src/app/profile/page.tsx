'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAllWeights } from '@/lib/hooks/useAllWeights';
import { useLatestMeasurement } from '@/lib/hooks/useLatestMeasurement';
import {
  ACTIVITY_LABELS,
  ACTIVITY_COEFFICIENTS,
  calcAge,
  calcBMR,
  calcTarget,
  calcWeightTrend,
  formulaicTDEEProvider,
} from '@/lib/nutrition';
import { getBFPercent, calcLBM } from '@/lib/nutrition/bodyComposition';
import {
  calcBMI,
  calcWHR,
  calcWaistToHeight,
  type MarkerStatus,
} from '@/lib/nutrition/healthMarkers';
import { calcClothingSizes } from '@/lib/nutrition/clothingSizes';
import { getRepositories } from '@/lib/repositories';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EditFieldModal, type EditField } from '@/components/EditFieldModal';
import { GoalEditModal } from '@/components/GoalEditModal';
import type { Goal, GoalType, WeightContext, WeightEntry } from '@/db/types';

type EditTarget =
  | 'nickname'
  | 'sex'
  | 'dateOfBirth'
  | 'heightCm'
  | 'activityLevel'
  | 'weight'
  | 'goal';

const GOAL_TITLES: Record<GoalType, string> = {
  hold: 'Удержать вес',
  lose: 'Похудеть',
  gain: 'Набрать',
  recomp: 'Рекомпозиция',
  track: 'Просто трек',
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    loading: profileLoading,
    error,
    clear,
    updateField,
  } = useProfile();
  const {
    entries,
    loading: weightsLoading,
    refresh: refreshWeights,
  } = useAllWeights();
  const { entry: latestMeasurement, loading: mLoading } =
    useLatestMeasurement();

  const [editing, setEditing] = useState<EditTarget | null>(null);

  const loading = profileLoading || weightsLoading || mLoading;

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/onboarding');
    }
  }, [loading, profile, router]);

  const trend = useMemo(() => calcWeightTrend(entries), [entries]);

  const bfInfo = useMemo(() => {
    if (!profile) return null;
    return getBFPercent({
      bioimpedance: null,
      circumferences: latestMeasurement,
      profile: { sex: profile.sex, heightCm: profile.heightCm },
    });
  }, [profile, latestMeasurement]);

  const nutrition = useMemo(() => {
    if (!profile || trend.source === 'none') return null;
    const ageYears = calcAge(profile.dateOfBirth);
    const bmr = calcBMR({
      sex: profile.sex,
      weightKg: trend.value,
      heightCm: profile.heightCm,
      ageYears,
      bfPercent: bfInfo?.value,
      bfSource: bfInfo?.source,
    });
    const tdee = formulaicTDEEProvider({
      bmr: bmr.value,
      activityLevel: profile.activityLevel,
    });
    return { ageYears, bmr, tdee };
  }, [profile, trend, bfInfo]);

  const bodyComposition = useMemo(() => {
    if (!profile || !bfInfo || trend.source === 'none') return null;
    const lbm = calcLBM(trend.value, bfInfo.value);
    const fatKg = Math.round((trend.value - lbm) * 10) / 10;
    return { bfPercent: bfInfo.value, source: bfInfo.source, lbm, fatKg };
  }, [profile, bfInfo, trend]);

  const healthMarkers = useMemo(() => {
    if (!profile || trend.source === 'none') return null;
    const bmi = calcBMI(trend.value, profile.heightCm);
    const whr =
      latestMeasurement?.waistCm && latestMeasurement.hipCm
        ? calcWHR(
            latestMeasurement.waistCm,
            latestMeasurement.hipCm,
            profile.sex,
          )
        : null;
    const wth =
      latestMeasurement?.waistCm
        ? calcWaistToHeight(latestMeasurement.waistCm, profile.heightCm)
        : null;
    return { bmi, whr, wth };
  }, [profile, trend, latestMeasurement]);

  const clothingSizes = useMemo(() => {
    if (!profile || !latestMeasurement) return null;
    const sizes = calcClothingSizes({
      sex: profile.sex,
      chestCm: latestMeasurement.chestCm,
      waistCm: latestMeasurement.waistCm,
      hipCm: latestMeasurement.hipCm,
      neckCm: latestMeasurement.neckCm,
    });
    if (!sizes.top && !sizes.bottom && !sizes.jeans && !sizes.collar)
      return null;
    return sizes;
  }, [profile, latestMeasurement]);

  const target = useMemo(() => {
    if (!profile || !nutrition || trend.source === 'none') return null;
    return calcTarget({
      tdee: nutrition.tdee.value,
      bmr: nutrition.bmr.value,
      sex: profile.sex,
      goal: profile.goal,
      currentWeightKg: trend.value,
    });
  }, [profile, nutrition, trend]);

  const editField: EditField | null = useMemo(() => {
    if (!editing || !profile) return null;
    switch (editing) {
      case 'nickname':
        return { kind: 'text', label: 'Никнейм', value: profile.nickname };
      case 'sex':
        return { kind: 'sex', label: 'Пол', value: profile.sex };
      case 'dateOfBirth':
        return {
          kind: 'date',
          label: 'Дата рождения',
          value: profile.dateOfBirth,
          max: new Date().toISOString().slice(0, 10),
        };
      case 'heightCm':
        return {
          kind: 'number',
          label: 'Рост',
          value: profile.heightCm,
          unit: 'см',
          min: 100,
          max: 250,
          step: 1,
        };
      case 'activityLevel':
        return {
          kind: 'activity',
          label: 'Уровень активности',
          value: profile.activityLevel,
        };
      case 'weight':
        return {
          kind: 'weight',
          label: 'Новый замер веса',
          value: trend.value || 80,
          context: 'morning-fasted' as WeightContext,
        };
      case 'goal':
        return null; // goal имеет отдельную модалку
    }
  }, [editing, profile, trend]);

  async function handleSaveField(f: EditField) {
    if (!profile) return;
    switch (f.kind) {
      case 'text':
        await updateField({ nickname: f.value.trim() });
        break;
      case 'sex':
        await updateField({ sex: f.value });
        break;
      case 'date':
        await updateField({ dateOfBirth: f.value });
        break;
      case 'number':
        await updateField({ heightCm: f.value });
        break;
      case 'activity':
        await updateField({ activityLevel: f.value });
        break;
      case 'weight': {
        const newEntry: WeightEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          kg: f.value,
          context: f.context,
        };
        await getRepositories().weight.add(newEntry);
        await refreshWeights();
        break;
      }
    }
    setEditing(null);
  }

  async function handleSaveGoal(next: Goal) {
    await updateField({ goal: next });
    setEditing(null);
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <header className="mb-6 flex items-center justify-between rounded-full border border-line/60 bg-paper-2/70 px-4 py-2.5 backdrop-blur-md sm:mb-8 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="font-display text-[18px] font-extrabold tracking-tight text-ink transition-opacity hover:opacity-70 sm:text-[20px]"
          >
            Life<span className="text-accent">.</span>Game
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavPill label="Профиль" active />
            <NavPill href="/weight" label="Вес" />
            <NavPill href="/measurements" label="Обхваты" />
            <NavPill label="Еда" disabled />
          </div>

          <ThemeToggle />
        </header>

        {loading && (
          <section className="flex flex-1 items-center justify-center py-32">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink-3">
              загрузка…
            </p>
          </section>
        )}

        {error && (
          <section className="rounded-[14px] border border-danger/40 bg-danger/10 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-danger">
              ошибка
            </p>
            <p className="mt-2 text-[14px] text-ink-2">{error}</p>
          </section>
        )}

        {profile && !loading && trend.source === 'none' && (
          <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <p className="eyebrow mb-4">нет замеров веса</p>
            <h2 className="font-display text-ink text-[32px] leading-tight tracking-tight sm:text-[40px]">
              Добавь первый замер
            </h2>
            <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-ink-3">
              Чтобы посчитать твою дневную норму, нужен хотя бы один утренний
              замер веса натощак.
            </p>
            <Link
              href="/weight"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-accent-deep hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)]"
            >
              + добавить замер
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </section>
        )}

        {profile && nutrition && target && trend.source !== 'none' && (
          <>
            {/* Приветствие */}
            <section className="mb-6 sm:mb-8">
              <p className="eyebrow mb-3">твой профиль</p>
              <h1 className="font-display text-ink leading-[0.95] tracking-tight text-[36px] sm:text-[52px] lg:text-[64px]">
                Привет,{' '}
                <span className="font-display-italic text-accent">
                  {profile.nickname}
                </span>
              </h1>
            </section>

            {/* Hero: goal-based daily target */}
            <section className="mb-4">
              <article className="relative overflow-hidden rounded-[20px] border border-line/60 bg-gradient-to-br from-paper-3 to-paper-2 p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                    твоя дневная норма
                  </span>
                  <span className="rounded-full bg-paper-3 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-2">
                    {GOAL_TITLES[profile.goal.type]}
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="font-display text-ink text-[80px] leading-none sm:text-[104px] lg:text-[120px]">
                    {target.target}
                  </span>
                  <span className="font-mono text-[13px] uppercase tracking-widest text-ink-3">
                    ккал / сутки
                  </span>
                </div>

                <p className="mt-4 max-w-[52ch] text-[13px] leading-relaxed text-ink-2 sm:text-[14px]">
                  {profile.goal.type === 'hold' && (
                    <>Столько нужно, чтобы удерживать вес при активности «{ACTIVITY_LABELS[profile.activityLevel].title.toLowerCase()}».</>
                  )}
                  {profile.goal.type === 'lose' && (
                    <>
                      Дефицит {target.deficitKcal} ккал/день от нормы {nutrition.tdee.value} ккал.
                      Темп: <strong>{target.weeklyPaceKg} кг/нед</strong>.
                    </>
                  )}
                  {profile.goal.type === 'gain' && (
                    <>
                      Профицит {Math.abs(target.deficitKcal)} ккал/день от нормы {nutrition.tdee.value} ккал.
                      Темп: <strong>{target.weeklyPaceKg} кг/нед</strong>.
                    </>
                  )}
                  {profile.goal.type === 'recomp' && (
                    <>Фиксированный дефицит −200 ккал от нормы {nutrition.tdee.value}. Жир → мышцы, вес меняется медленно.</>
                  )}
                  {profile.goal.type === 'track' && (
                    <>Просто трекинг — дневная норма для удержания веса. Логгируй что ешь, смотри что получается.</>
                  )}
                </p>

                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
                />
              </article>

              {/* Safety floor warning — только при lose */}
              {target.isSafeMinBreached && (
                <div className="mt-3 rounded-[12px] border-2 border-danger bg-danger/10 p-4 text-[13px] leading-snug text-ink-2">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-danger">
                    ⚠ ниже безопасного минимума
                  </p>
                  Норма {target.target} ккал ниже безопасного минимума{' '}
                  {target.safeMinKcal} ккал (max из BMR {target.bmrKcal} и медицинского минимума {target.medicalMinKcal} ккал/сут для{' '}
                  {profile.sex === 'M' ? 'мужчин' : 'женщин'}). Замедлит метаболизм, приведёт к потере мышц. Максимум темпа — <strong>{target.aggressiveLimitKg} кг/нед</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => setEditing('goal')}
                    className="text-accent underline hover:text-accent-deep"
                  >
                    сбавить темп
                  </button>
                </div>
              )}

              {target.paceIsAggressive && !target.isSafeMinBreached && (
                <div className="mt-3 rounded-[12px] border border-danger/60 bg-danger/10 p-4 text-[13px] leading-snug text-ink-2">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-danger">
                    агрессивный темп
                  </p>
                  {target.weeklyPaceKg} кг/нед выше рекомендуемого 1% массы тела ({target.aggressiveLimitKg} кг/нед). Мышцы могут пострадать.
                </div>
              )}
            </section>

            {/* Сводка */}
            <section className="mt-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-ink text-[22px] leading-tight tracking-tight sm:text-[28px]">
                  Сводка{' '}
                  <span className="font-display-italic text-ink-3">
                    обо мне
                  </span>
                </h2>
                <span className="eyebrow shrink-0">клик — изменить</span>
              </div>

              <div className="grid grid-cols-1 gap-[1px] overflow-hidden rounded-[16px] border border-line/60 bg-line/60 sm:grid-cols-2">
                <SummaryTile
                  label="Никнейм"
                  value={profile.nickname}
                  category="основа"
                  onClick={() => setEditing('nickname')}
                />
                <SummaryTile
                  label="Пол"
                  value={profile.sex === 'M' ? 'Мужской' : 'Женский'}
                  category="основа"
                  onClick={() => setEditing('sex')}
                />
                <SummaryTile
                  label="Дата рождения"
                  value={new Date(profile.dateOfBirth).toLocaleDateString('ru-RU')}
                  meta={`${nutrition.ageYears} лет`}
                  category="основа"
                  onClick={() => setEditing('dateOfBirth')}
                />
                <SummaryTile
                  label="Рост"
                  value={`${profile.heightCm} см`}
                  category="тело"
                  onClick={() => setEditing('heightCm')}
                />
                <SummaryTile
                  label="Вес (тренд)"
                  value={`${trend.value} кг`}
                  meta={
                    trend.source === 'trend'
                      ? `7-дн среднее по ${trend.entriesUsed} утр. натощак`
                      : `последний замер · нужно ещё замеров для тренда`
                  }
                  category="тело"
                  onClick={() => setEditing('weight')}
                />
                <SummaryTile
                  label="Активность"
                  value={ACTIVITY_LABELS[profile.activityLevel].title}
                  meta={`× ${ACTIVITY_COEFFICIENTS[profile.activityLevel]}`}
                  category="тело"
                  onClick={() => setEditing('activityLevel')}
                />
                <SummaryTile
                  label="Цель"
                  value={GOAL_TITLES[profile.goal.type]}
                  meta={
                    profile.goal.type === 'lose' || profile.goal.type === 'gain'
                      ? `${target.weeklyPaceKg > 0 ? target.weeklyPaceKg + ' кг/нед' : 'темп: укажи дедлайн'}${
                          profile.goal.targetWeightKg
                            ? ` → ${profile.goal.targetWeightKg} кг`
                            : ''
                        }${
                          profile.goal.targetDate
                            ? ` к ${new Date(profile.goal.targetDate).toLocaleDateString('ru-RU')}`
                            : ''
                        }`
                      : profile.goal.type === 'recomp'
                        ? 'жир → мышцы, −200 ккал/сут'
                        : profile.goal.type === 'hold'
                          ? 'удержание, дневная норма = TDEE'
                          : 'просто трек без плана'
                  }
                  category="цель"
                  onClick={() => setEditing('goal')}
                />
                <SummaryTile
                  label="BMR"
                  value={`${nutrition.bmr.value} ккал`}
                  meta={
                    nutrition.bmr.source === 'katch-mcardle'
                      ? `Katch-McArdle · через ${nutrition.bmr.bfSource}`
                      : 'Mifflin-St Jeor · без учёта BF%'
                  }
                  category="расчёт"
                  readonly
                />
                {bodyComposition ? (
                  <SummaryTile
                    label="Состав тела"
                    value={`${bodyComposition.bfPercent.toFixed(1)}% жира`}
                    meta={`LBM ${bodyComposition.lbm} кг · жир ${bodyComposition.fatKg} кг · источник: ${bodyComposition.source}`}
                    category="расчёт"
                    readonly
                  />
                ) : (
                  <SummaryTile
                    label="Обхваты"
                    value="не заведены"
                    meta="талия + шея (+ бёдра для Ж) → BF% через Navy"
                    category="дополнительно"
                    onClick={() => router.push('/measurements')}
                  />
                )}
                <SummaryTile
                  label="Биоимпеданс"
                  value="не заведён"
                  meta="жир % · мышцы % · вода % — прямой замер, точнее Navy"
                  category="дополнительно"
                  pending
                />
              </div>
            </section>

            {/* Здоровье-маркеры */}
            {healthMarkers && (
              <section className="mt-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-display text-ink text-[22px] leading-tight tracking-tight sm:text-[28px]">
                    Здоровье{' '}
                    <span className="font-display-italic text-ink-3">
                      маркеры
                    </span>
                  </h2>
                  <span className="eyebrow shrink-0">антропометрия</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MarkerCard
                    label="BMI"
                    value={healthMarkers.bmi.value.toFixed(1)}
                    status={healthMarkers.bmi.status}
                    statusLabel={healthMarkers.bmi.label}
                    hint="вес / рост² · норма 18.5–24.9"
                  />
                  {healthMarkers.whr ? (
                    <MarkerCard
                      label="WHR (талия / попа)"
                      value={healthMarkers.whr.value.toFixed(2)}
                      status={healthMarkers.whr.status}
                      statusLabel={healthMarkers.whr.label}
                      hint={
                        profile.sex === 'M'
                          ? 'риск сердечно-сосуд · норма < 0.90'
                          : 'риск сердечно-сосуд · норма < 0.85'
                      }
                    />
                  ) : (
                    <MarkerPending
                      label="WHR (талия / попа)"
                      hint="нужны талия + бёдра"
                    />
                  )}
                  {healthMarkers.wth ? (
                    <MarkerCard
                      label="Талия / рост"
                      value={healthMarkers.wth.value.toFixed(2)}
                      status={healthMarkers.wth.status}
                      statusLabel={healthMarkers.wth.label}
                      hint="висцеральный жир · норма < 0.50"
                    />
                  ) : (
                    <MarkerPending
                      label="Талия / рост"
                      hint="нужна талия из обхватов"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Размеры одежды */}
            {clothingSizes && (
              <section className="mt-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-display text-ink text-[22px] leading-tight tracking-tight sm:text-[28px]">
                    Размеры{' '}
                    <span className="font-display-italic text-ink-3">
                      одежды
                    </span>
                  </h2>
                  <span className="eyebrow shrink-0">RU / EU</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {clothingSizes.top && (
                    <SizeCard
                      label="Верх"
                      value={`RU ${clothingSizes.top.ru}`}
                      meta={clothingSizes.top.alpha}
                    />
                  )}
                  {clothingSizes.bottom && (
                    <SizeCard
                      label="Низ"
                      value={`RU ${clothingSizes.bottom.ru}`}
                    />
                  )}
                  {clothingSizes.jeans && (
                    <SizeCard
                      label="Джинсы"
                      value={`W${clothingSizes.jeans.w}`}
                      meta="талия, дюймы"
                    />
                  )}
                  {clothingSizes.collar && (
                    <SizeCard
                      label="Воротник"
                      value={`${clothingSizes.collar.size}`}
                      meta="рубашка"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="mt-auto pt-8 sm:pt-10">
              <div className="h-px w-full bg-line/60" />
              <div className="mt-5 flex flex-col-reverse items-start justify-between gap-4 sm:mt-6 sm:flex-row sm:items-center">
                <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 sm:text-[11px]">
                  локально · IndexedDB · id: {profile.id} · TDEE source:{' '}
                  {nutrition.tdee.source} ({nutrition.tdee.confidence})
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      confirm(
                        'Стереть профиль и вернуться на онбординг? Отмена невозможна.',
                      )
                    ) {
                      await clear();
                      router.replace('/onboarding');
                    }
                  }}
                  className="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-danger"
                >
                  начать заново
                </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {editField && (
        <EditFieldModal
          field={editField}
          onCancel={() => setEditing(null)}
          onSave={handleSaveField}
        />
      )}

      {editing === 'goal' && profile && nutrition && trend.source !== 'none' && (
        <GoalEditModal
          currentGoal={profile.goal}
          currentWeightKg={trend.value}
          sex={profile.sex}
          tdee={nutrition.tdee.value}
          bmr={nutrition.bmr.value}
          onCancel={() => setEditing(null)}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}

/* ─── helpers ─── */

function NavPill({
  label,
  active,
  disabled,
  href,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
}) {
  const className = `rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px] ${
    active
      ? 'bg-accent text-paper'
      : disabled
        ? 'text-ink-3/50 cursor-not-allowed'
        : 'text-ink-3 hover:bg-paper-3 hover:text-ink-2'
  }`;

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return <span className={className}>{label}</span>;
}

function MarkerCard({
  label,
  value,
  status,
  statusLabel,
  hint,
}: {
  label: string;
  value: string;
  status: MarkerStatus;
  statusLabel: string;
  hint: string;
}) {
  const statusStyles: Record<MarkerStatus, string> = {
    good: 'border-success/50 bg-success/10 text-success',
    warning: 'border-warning/50 bg-warning/10 text-warning',
    bad: 'border-danger/50 bg-danger/10 text-danger',
  };
  return (
    <div className="rounded-[14px] border border-line/60 bg-paper-2 p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
          {label}
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${statusStyles[status]}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mt-2 font-display text-[32px] leading-none text-ink sm:text-[36px]">
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-ink-3">{hint}</p>
    </div>
  );
}

function MarkerPending({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line/60 bg-paper-2/50 p-5 opacity-60">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
        {label}
      </p>
      <p className="mt-2 font-display text-[22px] italic text-ink-3">—</p>
      <p className="mt-2 text-[11px] leading-snug text-ink-3">{hint}</p>
    </div>
  );
}

function SizeCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-[14px] border border-line/60 bg-paper-2 p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
        {label}
      </p>
      <p className="mt-2 font-display text-[24px] leading-tight text-ink sm:text-[28px]">
        {value}
      </p>
      {meta && (
        <p className="mt-1 font-mono text-[10px] tracking-widest text-ink-3">
          {meta}
        </p>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  meta,
  category,
  onClick,
  pending,
  readonly,
}: {
  label: string;
  value: string;
  meta?: string;
  category: 'основа' | 'тело' | 'расчёт' | 'дополнительно' | 'цель';
  onClick?: () => void;
  pending?: boolean;
  readonly?: boolean;
}) {
  const clickable = !!onClick && !pending && !readonly;
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`group relative flex items-start gap-4 bg-paper-2 p-5 text-left transition-colors ${
        clickable
          ? 'hover:bg-paper-3 cursor-pointer'
          : pending
            ? 'opacity-60'
            : 'cursor-default'
      }`}
    >
      <div className="flex-1">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {label}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-ink-3/70">
            · {category}
          </span>
        </div>
        <p
          className={`font-display leading-tight tracking-tight ${
            pending
              ? 'text-[18px] text-ink-3 italic'
              : 'text-[22px] text-ink sm:text-[24px]'
          }`}
        >
          {value}
        </p>
        {meta && (
          <p className="mt-1.5 text-[11px] leading-snug text-ink-3">{meta}</p>
        )}
      </div>

      {clickable && (
        <span
          aria-hidden
          className="mt-1 font-mono text-[11px] tracking-widest text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
        >
          →
        </span>
      )}
      {readonly && (
        <span
          aria-hidden
          className="mt-1 font-mono text-[10px] tracking-widest text-ink-3/60"
        >
          авто
        </span>
      )}
      {pending && (
        <span
          aria-hidden
          className="mt-1 font-mono text-[10px] tracking-widest text-accent/70"
        >
          скоро
        </span>
      )}
    </button>
  );
}
