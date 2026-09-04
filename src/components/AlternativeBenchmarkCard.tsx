import React from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { Scale, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface AlternativeBenchmarkCardProps {
  winner: ScenarioResult | null;
  osnoScenario: ScenarioResult | null;
  runnerUp: ScenarioResult | null;
  distributeProfitsToOwner: boolean;
  onSelectScenario: (scenario: ScenarioResult) => void;
}

export const AlternativeBenchmarkCard: React.FC<AlternativeBenchmarkCardProps> = ({
  winner,
  osnoScenario,
  runnerUp,
  distributeProfitsToOwner,
  onSelectScenario,
}) => {
  if (!winner) return null;

  const winnerProfit = distributeProfitsToOwner ? winner.netCashInHand : winner.netCompanyProfit;
  const osnoProfit = osnoScenario
    ? distributeProfitsToOwner
      ? osnoScenario.netCashInHand
      : osnoScenario.netCompanyProfit
    : 0;
  const runnerUpProfit = runnerUp
    ? distributeProfitsToOwner
      ? runnerUp.netCashInHand
      : runnerUp.netCompanyProfit
    : 0;

  const osnoSavings = winnerProfit - osnoProfit;
  const runnerUpDelta = runnerUp ? winnerProfit - runnerUpProfit : 0;

  return (
    <div className="spectral-glass-panel p-4 sm:p-5 h-full flex flex-col justify-between space-y-3.5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
            <Scale className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Бенчмарк: Лидер vs Альтернативы
          </h3>
        </div>
        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
          Экономия: +{formatCompactRubles(osnoSavings)}
        </span>
      </div>

      {/* Comparison rows */}
      <div className="space-y-2.5 text-xs flex-1 relative z-10">
        {/* Row 1: VS OSNO */}
        {osnoScenario && (
          <div
            onClick={() => onSelectScenario(osnoScenario)}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-white/75 hover:bg-white hover:border-slate-300 transition-all cursor-pointer space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Базовый режим: ОСНО (НДС 22% + Налог на прибыль/НДФЛ)
              </span>
              <span className="font-bold text-slate-600 text-[11px]">
                {formatPercent(osnoScenario.effectiveTaxRate)} эфф.
              </span>
            </div>
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="text-slate-500 font-medium">Чистыми при ОСНО:</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatCompactRubles(osnoProfit)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">
              ✓ Оптимальный режим даёт на +{formatCompactRubles(osnoSavings)} больше чистых денег
            </div>
          </div>
        )}

        {/* Row 2: VS Runner-up */}
        {runnerUp && runnerUp.id !== winner.id && (
          <div
            onClick={() => onSelectScenario(runnerUp)}
            className="p-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/40 to-purple-50/30 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Ближайшая альтернатива: {runnerUp.shortName} ({runnerUp.vatDisplay})
              </span>
              <span className="font-bold text-indigo-700 text-[11px]">
                {formatPercent(runnerUp.effectiveTaxRate)} эфф.
              </span>
            </div>
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="text-slate-500 font-medium">Чистыми в альтернативе:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCompactRubles(runnerUpProfit)}
              </span>
            </div>
            <div className="text-[10px] text-indigo-700 font-bold">
              ✓ Преимущество лидера над №2 составляет +{formatCompactRubles(runnerUpDelta)}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-medium relative z-10">
        <span>Лимит выручки УСН: 450 млн ₽</span>
        <span className="font-bold text-slate-700">Порог НДС 5%: от 60 млн ₽</span>
      </div>
    </div>
  );
};
