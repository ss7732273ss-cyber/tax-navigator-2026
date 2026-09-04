import React from 'react';
import { BusinessProfile, LegislationParams } from '../types';
import { generateAndCalculateAllScenarios } from '../engine/navigatorCore';
import { formatCompactRubles, formatPercent } from '../utils/formatters';
import { SlidersHorizontal, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface MetalStressCardProps {
  profile: BusinessProfile;
  legislation: LegislationParams;
  onApplyRevenue: (revenue: number) => void;
}

export const MetalStressCard: React.FC<MetalStressCardProps> = ({
  profile,
  legislation,
  onApplyRevenue,
}) => {
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
      winnerVat: winner?.vatDisplay || '',
      profit,
      effectiveRate: winner?.effectiveTaxRate || 0,
    };
  });

  return (
    <div className="metal-glow-wrapper transition-all duration-300 hover:scale-[1.01]">
      <div className="metal-glow-inner p-5 sm:p-6 text-white relative overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
        {/* Ambient subtle light inside */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Top badge & icon */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
              Стресс-тест 2026
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-purple-300 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight leading-snug">
            Устойчивость режима к колебаниям выручки
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
            Кликните по карточке множителя для моментального применения в модели:
          </p>

          {/* Interactive Multiplier Grid */}
          <div className="grid grid-cols-3 gap-2 my-4">
            {points.map((pt, idx) => {
              const isCurrent = pt.multiplier === 1.0;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onApplyRevenue(pt.revenue)}
                  className={`p-2.5 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80 border-cyan-300/80 shadow-[0_0_15px_rgba(56,189,248,0.4)] text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/25 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">
                      {pt.multiplier}×
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {formatCompactRubles(pt.revenue)}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-white truncate mt-1">
                    {pt.winnerName}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold tabular-nums">
                    {formatCompactRubles(pt.profit)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom indicator pill row (matching JL + TU pills from reference) */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-slate-900 shadow-sm">
              НК 2026
            </span>
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/10">
              Порог НДС 60 млн ₽
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Лимит 450 млн ₽
          </span>
        </div>
      </div>
    </div>
  );
};
