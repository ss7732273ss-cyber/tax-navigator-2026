import React from 'react';
import { BusinessProfile, ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { TrendingUp, ArrowUpRight, ShieldCheck, Sparkles, Sliders } from 'lucide-react';

interface MetricStripProps {
  profile: BusinessProfile;
  winner: ScenarioResult | null;
  osnoScenario: ScenarioResult | null;
  distributeProfitsToOwner: boolean;
  onOpenPresets?: () => void;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  profile,
  winner,
  osnoScenario,
  distributeProfitsToOwner,
  onOpenPresets,
}) => {
  if (!winner) return null;

  const winnerProfit = distributeProfitsToOwner ? winner.netCashInHand : winner.netCompanyProfit;
  const osnoProfit = osnoScenario
    ? distributeProfitsToOwner
      ? osnoScenario.netCashInHand
      : osnoScenario.netCompanyProfit
    : 0;

  const diffVsOsno = Math.max(0, winnerProfit - osnoProfit);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-2">
      {/* 1. Выручка бизнеса */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Выручка бизнеса (брутто)
        </span>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatRubles(profile.revenueGross)}
        </div>
        <span className="text-[11px] font-medium text-slate-500 block">
          База расчета лимитов и НДС 2026
        </span>
      </div>

      {/* 2. Чистая выгода лидера */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          {distributeProfitsToOwner ? 'Чистыми на руках' : 'Чистая прибыль'}
        </span>
        <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
          {formatRubles(winnerProfit)}
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Лидер: {winner.shortName}
        </span>
      </div>

      {/* 3. Экономия против ОСНО */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Экономия против ОСНО
        </span>
        <div className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight tabular-nums">
          +{formatCompactRubles(diffVsOsno)}
        </div>
        <span className="text-[11px] font-medium text-slate-500 block">
          Выгода выбранного спецрежима
        </span>
      </div>

      {/* 4. Налоговая нагрузка & Эфф. ставка */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Эффективная ставка
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {winner.vatDisplay}
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatPercent(winner.effectiveTaxRate)}
        </div>
        <span className="text-[11px] font-medium text-slate-500 block">
          Всего налогов: {formatCompactRubles(winner.totalTaxBurden)}
        </span>
      </div>
    </div>
  );
};
