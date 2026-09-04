import React from 'react';
import { BusinessProfile, LegislationParams } from '../types';
import { generateAndCalculateAllScenarios } from '../engine/navigatorCore';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

interface SensitivitySliderProps {
  profile: BusinessProfile;
  legislation: LegislationParams;
  onApplyRevenue: (revenue: number) => void;
}

export const SensitivitySlider: React.FC<SensitivitySliderProps> = ({
  profile,
  legislation,
  onApplyRevenue,
}) => {
  // Test points around current revenue: [0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x]
  const baseRevenue = profile.revenueGross;
  const multipliers = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const points = multipliers.map((m) => {
    const rev = Math.round(baseRevenue * m);
    const variableExp = Math.round(profile.variableExpensesGross * m);
    const simProfile: BusinessProfile = {
      ...profile,
      revenueGross: rev,
      variableExpensesGross: variableExp,
      useMonthlyDistribution: false,
    };
    const { winner } = generateAndCalculateAllScenarios(simProfile, legislation);
    const profit = winner
      ? profile.distributeProfitsToOwner
        ? winner.netCashInHand
        : winner.netCompanyProfit
      : 0;

    return {
      multiplier: m,
      revenue: rev,
      winnerName: winner?.shortName || '—',
      winnerForm: winner?.orgForm || 'IP',
      winnerVat: winner?.vatDisplay || '',
      profit,
      effectiveRate: winner?.effectiveTaxRate || 0,
    };
  });

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.02)] p-5 lg:p-6 space-y-4 ring-1 ring-black/[0.03] relative overflow-hidden">
      {/* Specular top border highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            Стресс-тест и чувствительность к объёму выручки
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 tracking-tight">
            Как изменится оптимальный режим при росте или спаде продаж?
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Кликните по карточке для применения выручки к текущей модели
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {points.map((pt, idx) => {
          const isCurrent = pt.multiplier === 1.0;
          return (
            <div
              key={idx}
              onClick={() => onApplyRevenue(pt.revenue)}
              className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer text-left flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/80 border-indigo-400/80 ring-2 ring-indigo-500/25 shadow-xs'
                  : 'bg-white/70 backdrop-blur-sm border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-[0.98]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${
                      isCurrent ? 'bg-indigo-600 text-white shadow-[0_2px_6px_rgba(79,70,229,0.3)]' : 'bg-slate-100/90 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {isCurrent ? 'Текущая' : `${pt.multiplier}×`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    {formatCompactRubles(pt.revenue)}
                  </span>
                </div>

                <div className="text-xs font-extrabold text-slate-900 mt-2.5 truncate" title={pt.winnerName}>
                  {pt.winnerName}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                  {pt.winnerVat}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/70">
                <div className="text-[10px] font-medium text-slate-400">Чистая выгода:</div>
                <div className="text-xs font-extrabold text-emerald-700 tabular-nums">
                  {formatCompactRubles(pt.profit)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Эфф.: {formatPercent(pt.effectiveRate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
