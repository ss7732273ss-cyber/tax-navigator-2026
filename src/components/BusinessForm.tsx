import React, { useState } from 'react';
import {
  BusinessOriginStatus,
  BusinessProfile,
  OrgFormSelection,
  PriorYearRevenueBand,
} from '../types';
import { BUSINESS_PRESETS } from '../config/presets';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import {
  Building2,
  User,
  Users,
  Calendar,
  Sliders,
  TrendingUp,
  Receipt,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Coins,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface BusinessFormProps {
  profile: BusinessProfile;
  onChange: (updated: BusinessProfile) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ profile, onChange }) => {
  const [showMonthly, setShowMonthly] = useState(profile.useMonthlyDistribution);

  const update = <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  const applyPreset = (presetId: string) => {
    const found = BUSINESS_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChange(found.profile);
      setShowMonthly(found.profile.useMonthlyDistribution);
    }
  };

  const handleMonthlyChange = (index: number, val: number) => {
    const arr = [...(profile.monthlyRevenues || new Array(12).fill(profile.revenueGross / 12))];
    arr[index] = Math.max(0, val);
    const total = arr.reduce((a, b) => a + b, 0);
    onChange({
      ...profile,
      revenueGross: total,
      monthlyRevenues: arr,
      useMonthlyDistribution: true,
    });
  };

  const monthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
  ];

  // Helper estimates for incoming VAT from suppliers (20/120)
  const estimatedVarVat = Math.round(profile.variableExpensesGross * profile.variableVatShare * (20 / 120));
  const estimatedFixedVat = Math.round(profile.fixedExpensesGross * profile.fixedVatShare * (20 / 120));

  return (
    <div className="spectral-glass-panel rounded-3xl p-5 sm:p-6 space-y-6 relative overflow-hidden shadow-sm">
      {/* Soft atmospheric ambient glow blooms */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Top Specular Rim Light */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      {/* Header bar: Section Title & Quick Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-white/40 shrink-0">
            <Sliders className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                1. Входные параметры бизнеса
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
                Конфигуратор
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Задайте структуру доходов, расходов и персонала для моделирования налоговых систем 2026 года
            </p>
          </div>
        </div>

        {/* Quick Presets with tactile pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Пресеты:</span>
          </div>
          {BUSINESS_PRESETS.map((preset) => {
            const isSelected =
              Math.abs(profile.revenueGross - preset.profile.revenueGross) < 1000 &&
              profile.employeeCount === preset.profile.employeeCount;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'tactile-pill-active'
                    : 'tactile-pill-inactive hover:border-indigo-300 hover:text-indigo-900 active:scale-[0.98]'
                }`}
                title={preset.description}
              >
                <span>{preset.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Balanced 2-Column Analytical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start relative z-10">
        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-4">
          {/* 1. Организационная форма бизнеса (Volumetric Tactile Segmented Control) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-slate-50/70 to-indigo-50/20 border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                Организационно-правовая форма
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {profile.orgForm === 'IP' ? 'Только ИП' : profile.orgForm === 'OOO' ? 'Только ООО' : 'Параллельный расчёт'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300/70 shadow-inner text-xs font-bold">
              <button
                type="button"
                onClick={() => update('orgForm', 'IP')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  profile.orgForm === 'IP'
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 font-extrabold'
                    : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 shadow-2xs border border-transparent hover:border-slate-200'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>ИП</span>
              </button>

              <button
                type="button"
                onClick={() => update('orgForm', 'OOO')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  profile.orgForm === 'OOO'
                    ? 'bg-gradient-to-b from-purple-600 to-fuchsia-700 text-white shadow-[0_3px_10px_rgba(168,85,247,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 font-extrabold'
                    : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 shadow-2xs border border-transparent hover:border-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>ООО</span>
              </button>

              <button
                type="button"
                onClick={() => update('orgForm', 'BOTH')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  profile.orgForm === 'BOTH'
                    ? 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-[0_3px_10px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 font-extrabold'
                    : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 shadow-2xs border border-transparent hover:border-slate-200'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Оба (сравнить)</span>
              </button>
            </div>
          </div>

          {/* 2. Налоговый статус на 01.01.2026 */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-slate-50/70 to-indigo-50/20 border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Налоговый статус на 01.01.2026 года</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">НК РФ ст. 145 / 346.12</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  ['EXISTING_USN', 'Действующий УСН', 'Продление режима'],
                  ['TRANSITION_FROM_OTHER', 'Переход на УСН', 'С ОСНО или др.'],
                  ['NEW_BUSINESS_2026', 'Новый бизнес', 'Регистрация 2026'],
                ] as [BusinessOriginStatus, string, string][]
              ).map(([status, title, sub]) => {
                const isActive = profile.originStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => update('originStatus', status)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-b from-indigo-50/90 via-white to-purple-50/50 border-indigo-500/90 text-indigo-950 shadow-[0_3px_10px_rgba(99,102,241,0.18)] ring-1.5 ring-indigo-500/30'
                        : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-indigo-300/80 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-extrabold leading-tight">{title}</div>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">{sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Доход за 2025 год */}
            {profile.originStatus !== 'NEW_BUSINESS_2026' && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700">
                    Доход за 2025 г. (база для ставки НДС 2026 по ст. 145/164 НК):
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Порог 20 млн ₽
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      ['UP_TO_20M', 'До 20 млн ₽', 'Освобождение ст.145', 'emerald'],
                      ['FROM_20M_TO_250M', '20–250 млн ₽', 'Старт с 5% или 22%', 'indigo'],
                      ['FROM_250M_TO_450M', '250–450 млн ₽', 'Старт с 7% или 22%', 'purple'],
                      ['OVER_450M', 'Свыше 450 млн ₽', 'Утрата УСН в 2025', 'rose'],
                    ] as [PriorYearRevenueBand, string, string, string][]
                  ).map(([band, label, hint, colorTheme]) => {
                    const isActive = profile.priorYearRevenueBand === band;

                    let activeClasses = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-1.5 ring-indigo-500/30 font-bold';
                    if (colorTheme === 'emerald') {
                      activeClasses = 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-1.5 ring-emerald-500/30 font-bold shadow-[0_2px_8px_rgba(16,185,129,0.18)]';
                    } else if (colorTheme === 'purple') {
                      activeClasses = 'bg-purple-50/90 border-purple-500 text-purple-950 ring-1.5 ring-purple-500/30 font-bold shadow-[0_2px_8px_rgba(168,85,247,0.18)]';
                    } else if (colorTheme === 'rose') {
                      activeClasses = 'bg-rose-50/90 border-rose-500 text-rose-950 ring-1.5 ring-rose-500/30 font-bold shadow-[0_2px_8px_rgba(244,63,94,0.18)]';
                    }

                    return (
                      <button
                        key={band}
                        type="button"
                        onClick={() => update('priorYearRevenueBand', band)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? activeClasses
                            : 'bg-white/80 border-slate-200/90 text-slate-700 hover:bg-white hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold leading-tight">{label}</div>
                        <div className="text-[9px] text-slate-500 font-medium mt-0.5 leading-tight">{hint}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Специальная проверка перехода для ООО */}
                {profile.originStatus === 'TRANSITION_FROM_OTHER' &&
                  (profile.orgForm === 'OOO' || profile.orgForm === 'BOTH') && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-300/90 shadow-2xs mt-1">
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!profile.ooo9MonthsLimitExceeded}
                          onChange={(e) => update('ooo9MonthsLimitExceeded', e.target.checked)}
                          className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
                        />
                        <div className="text-[11px] text-amber-950 font-medium leading-relaxed">
                          <strong className="font-bold text-amber-900 block">
                            Лимит 9 месяцев 2025 г. (п. 2 ст. 346.12 НК РФ):
                          </strong>
                          Доход ООО за 9 мес. 2025 г. превысил 337,5 млн ₽ (запрещает переход на УСН с 2026 года)
                        </div>
                      </label>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* 3. Персонал и фонд оплаты труда */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-slate-50/70 to-purple-50/20 border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Персонал и зарплатные налоги</span>
              </label>
              <span className="text-xs font-black text-purple-950 bg-purple-50 border border-purple-200/90 px-2.5 py-0.5 rounded-lg shadow-2xs tabular-nums">
                {profile.employeeCount} чел.
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                [0, '0 (без штата)'],
                [3, '1–5 (АУСН)'],
                [10, '6–15 чел.'],
                [35, '16–130 чел.'],
                [140, '> 130 (ОСНО)'],
              ].map(([cnt, label]) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    update('employeeCount', cnt as number);
                    if (cnt === 0) update('employeePayrollTaxes', 0);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    profile.employeeCount === cnt
                      ? 'tactile-pill-active'
                      : 'tactile-pill-inactive hover:border-purple-300 hover:text-purple-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {profile.employeeCount > 0 && (
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Страховые взносы за персонал в год</span>
                  </span>
                  <span className="text-xs font-black text-slate-900 tabular-nums bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {formatRubles(profile.employeePayrollTaxes || 0)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={profile.employeePayrollTaxes || ''}
                    onChange={(e) =>
                      update('employeePayrollTaxes', Math.max(0, Number(e.target.value)))
                    }
                    className="w-full pl-3.5 pr-14 py-2 text-xs font-bold rounded-xl border border-slate-300/90 bg-white/90 tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                    placeholder="Сумма страховых взносов, руб."
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                    ₽ / год
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-start gap-1.5 text-[10px] text-indigo-900 font-medium">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    На АУСН страховые взносы 0%, уплачивается только фиксированный травматизм (2 959 ₽ в год).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Налог на дивиденды ООО (Volumetric Toggle Card) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-indigo-50/40 border border-emerald-300/80 shadow-xs hover:border-emerald-400 transition-all">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profile.distributeProfitsToOwner}
                onChange={(e) => update('distributeProfitsToOwner', e.target.checked)}
                className="mt-1 rounded-md border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4 shadow-2xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Метрика «Чистые деньги на руках собственника»
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                    НДФЛ 0% vs 13-15%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Для ООО учитывает налог на дивиденды (13% до 2,4 млн ₽, 15% свыше). Для ИП прибыль выводится напрямую на личный счёт без налога на дивиденды.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-4">
          {/* 5. Выручка 2026 года (Главная визуальная карточка) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white/95 border border-indigo-200/90 shadow-[0_8px_24px_rgba(99,102,241,0.12)] relative overflow-hidden space-y-3.5">
            {/* Specular top rim light */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span>Выручка бизнеса в 2026 г. (брутто, с НДС)</span>
              </label>
              <div className="text-base sm:text-lg font-black text-indigo-700 tabular-nums bg-white/90 px-3 py-1 rounded-xl border border-indigo-200/80 shadow-2xs self-start sm:self-auto">
                {formatCompactRubles(profile.revenueGross)}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min={0}
                step={500000}
                value={profile.revenueGross || ''}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  update('revenueGross', val);
                  if (profile.useMonthlyDistribution) {
                    const avg = val / 12;
                    update('monthlyRevenues', new Array(12).fill(avg));
                  }
                }}
                placeholder="Сумма выручки брутто"
                className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-indigo-200/90 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-slate-900 font-black text-lg tabular-nums shadow-xs transition-all"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-indigo-500/80 pointer-events-none">
                ₽ / год
              </span>
            </div>

            {/* Быстрые пресеты выручки */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Быстрый выбор оборота:</span>
                <span className="text-slate-500 font-semibold">{formatRubles(profile.revenueGross)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[15_000_000, 45_000_000, 120_000_000, 260_000_000, 350_000_000, 520_000_000].map(
                  (val) => {
                    const isCurrent = profile.revenueGross === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => update('revenueGross', val)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isCurrent
                            ? 'tactile-pill-active'
                            : 'tactile-pill-inactive hover:border-indigo-400 hover:text-indigo-900'
                        }`}
                      >
                        {formatCompactRubles(val)}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Аккордеон помесячной сезонности */}
            <div className="pt-2 border-t border-indigo-100">
              <button
                type="button"
                onClick={() => {
                  const next = !showMonthly;
                  setShowMonthly(next);
                  update('useMonthlyDistribution', next);
                  if (next && (!profile.monthlyRevenues || profile.monthlyRevenues.length !== 12)) {
                    update('monthlyRevenues', new Array(12).fill(profile.revenueGross / 12));
                  }
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {showMonthly
                    ? 'Свернуть помесячное распределение (равномерно)'
                    : 'Уточнить помесячную сезонность (для точного месяца смены НДС)'}
                </span>
                {showMonthly ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showMonthly && (
                <div className="mt-2.5 p-3 rounded-2xl bg-white/95 border border-indigo-200/90 shadow-2xs space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Распределение выручки по месяцам (сумма формирует общую выручку):
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {monthNames.map((name, i) => {
                      const monthlyVal =
                        profile.monthlyRevenues && profile.monthlyRevenues[i] !== undefined
                          ? profile.monthlyRevenues[i]
                          : profile.revenueGross / 12;
                      return (
                        <div key={name} className="space-y-1">
                          <div className="text-[10px] font-extrabold text-slate-500 text-center">
                            {name}
                          </div>
                          <input
                            type="number"
                            min={0}
                            step={100000}
                            value={Math.round(monthlyVal) || ''}
                            onChange={(e) => handleMonthlyChange(i, Number(e.target.value))}
                            className="w-full text-center px-1.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Расходы бизнеса и входящий НДС */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Расходы бизнеса и входящий НДС
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Закупки и сервисы от поставщиков
              </span>
            </div>

            {/* Переменные расходы */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/95 via-amber-50/20 to-slate-50/80 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="p-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                    <Layers className="w-3 h-3" />
                  </span>
                  <span>Переменные расходы (себестоимость, закупки, сырье)</span>
                </span>
                <span className="text-xs font-black text-slate-900 tabular-nums bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                  {formatCompactRubles(profile.variableExpensesGross)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Сумма брутто (с НДС)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={100000}
                      value={profile.variableExpensesGross || ''}
                      onChange={(e) =>
                        update('variableExpensesGross', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full pl-3 pr-10 py-1.5 text-xs font-bold rounded-xl border border-slate-300/90 bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                      placeholder="Сумма, руб."
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-semibold text-slate-400 pointer-events-none">
                      ₽
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>С НДС 20% от поставщиков:</span>
                    <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md border border-amber-200 tabular-nums">
                      {formatPercent(profile.variableVatShare * 100, 0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={profile.variableVatShare}
                    onChange={(e) => update('variableVatShare', Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-400 font-medium flex justify-between">
                    <span>Входящий вычет:</span>
                    <span className="text-amber-800 font-bold">~{formatCompactRubles(estimatedVarVat)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Постоянные расходы */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/95 via-sky-50/20 to-slate-50/80 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="p-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                    <Receipt className="w-3 h-3" />
                  </span>
                  <span>Постоянные расходы (аренда, сервисы, маркетинг)</span>
                </span>
                <span className="text-xs font-black text-slate-900 tabular-nums bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                  {formatCompactRubles(profile.fixedExpensesGross)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Сумма брутто (с НДС)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={100000}
                      value={profile.fixedExpensesGross || ''}
                      onChange={(e) =>
                        update('fixedExpensesGross', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full pl-3 pr-10 py-1.5 text-xs font-bold rounded-xl border border-slate-300/90 bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                      placeholder="Сумма, руб."
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-semibold text-slate-400 pointer-events-none">
                      ₽
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>С НДС 20% от поставщиков:</span>
                    <span className="font-extrabold text-sky-700 bg-sky-50 px-2 py-0.2 rounded-md border border-sky-200 tabular-nums">
                      {formatPercent(profile.fixedVatShare * 100, 0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={profile.fixedVatShare}
                    onChange={(e) => update('fixedVatShare', Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-400 font-medium flex justify-between">
                    <span>Входящий вычет:</span>
                    <span className="text-sky-800 font-bold">~{formatCompactRubles(estimatedFixedVat)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

