import React from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { Award, ArrowUpRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface WinnerCardProps {
  winner: ScenarioResult | null;
  runnerUp: ScenarioResult | null;
  osnoScenario: ScenarioResult | null;
  distributeProfitsToOwner: boolean;
  onSelect: (scenario: ScenarioResult) => void;
}

export const WinnerCard: React.FC<WinnerCardProps> = ({
  winner,
  runnerUp,
  osnoScenario,
  distributeProfitsToOwner,
  onSelect,
}) => {
  if (!winner) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <div className="font-bold text-xs">Нет доступных налоговых режимов</div>
          <div className="text-[11px] text-rose-700 mt-0.5">
            Проверьте вводные параметры: возможно, превышены лимиты УСН/АУСН (450 млн ₽ или 130 чел.).
          </div>
        </div>
      </div>
    );
  }

  const primaryMetric = distributeProfitsToOwner
    ? winner.netCashInHand
    : winner.netCompanyProfit;

  const metricLabel = distributeProfitsToOwner
    ? 'Чистые деньги на руках'
    : 'Чистая прибыль компании';

  const runnerUpMetric = runnerUp
    ? distributeProfitsToOwner
      ? runnerUp.netCashInHand
      : runnerUp.netCompanyProfit
    : 0;

  const diffWithRunnerUp = runnerUp ? primaryMetric - runnerUpMetric : 0;

  const osnoMetric = osnoScenario
    ? distributeProfitsToOwner
      ? osnoScenario.netCashInHand
      : osnoScenario.netCompanyProfit
    : 0;

  const diffWithOsno = osnoScenario ? primaryMetric - osnoMetric : 0;

  return (
    <div className="rainbow-border-subtle h-full">
      <div className="rainbow-inner p-4 sm:p-5 h-full flex flex-col justify-between space-y-3.5 border border-white/60 relative overflow-hidden">
        {/* Soft specular light bloom in top-right */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar: Badges and Action button */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 text-emerald-800 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Оптимальный режим
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border shadow-2xs ${
              winner.orgForm === 'IP'
                ? 'bg-blue-50 text-blue-800 border-blue-200/90'
                : 'bg-purple-50 text-purple-800 border-purple-200/90'
            }`}>
              {winner.orgForm === 'IP' ? 'ИП' : 'ООО'}
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
              {winner.vatDisplay}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(winner)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-indigo-50 to-indigo-100/80 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200/90 shadow-[0_2px_6px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] active:scale-[0.98] shrink-0"
            title="Перейти к детальному отчету P&L"
          >
            <span>P&L отчёт</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Regime name and Financial Result */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1 border-t border-slate-200/60 relative z-10">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
              {winner.name}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
              {winner.calendarNote || 'Максимальный чистый финансовый результат при заданных доходах и расходах.'}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {metricLabel}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 drop-shadow-[0_1px_2px_rgba(16,185,129,0.15)] tabular-nums tracking-tight">
              {formatRubles(primaryMetric)}
            </div>
          </div>
        </div>

        {/* 4-KPI Compact Micro Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 relative z-10">
          {/* 1. Эффективная ставка */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-slate-50/80 border border-indigo-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Эфф. ставка
            </span>
            <div className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
              {formatPercent(winner.effectiveTaxRate)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block truncate">от выручки брутто</span>
          </div>

          {/* 2. Всего налогов и сборов */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-50/40 to-slate-50/80 border border-rose-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Всего налогов
            </span>
            <div className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
              {formatCompactRubles(winner.totalTaxBurden)}
            </div>
            <span className="text-[10px] text-rose-700/80 font-semibold block truncate">
              НДС: {formatCompactRubles(winner.vatPayable)}
            </span>
          </div>

          {/* 3. Экономия против ОСНО */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-300/80 shadow-[0_2px_8px_rgba(16,185,129,0.12)]">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Экономия vs ОСНО
            </span>
            <div className="text-sm font-black text-emerald-700 tabular-nums mt-0.5">
              {diffWithOsno > 0 ? `+${formatCompactRubles(diffWithOsno)}` : '0 ₽'}
            </div>
            <span className="text-[10px] text-emerald-700/80 font-medium block truncate">к общей системе</span>
          </div>

          {/* 4. Запас к конкуренту №2 */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
              Запас к №2
            </span>
            <div className="text-sm font-black text-purple-800 tabular-nums mt-0.5">
              {diffWithRunnerUp > 0 ? `+${formatCompactRubles(diffWithRunnerUp)}` : 'Единственный'}
            </div>
            <span className="text-[10px] text-purple-700/80 font-medium block truncate">
              {runnerUp ? `vs ${runnerUp.shortName}` : 'Нет равных'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
