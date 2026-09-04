import React from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { User, Building2, ArrowUpRight, Scale } from 'lucide-react';

interface IpVsOooComparisonProps {
  bestIp: ScenarioResult | null;
  bestOoo: ScenarioResult | null;
  distributeProfitsToOwner: boolean;
  onSelectScenario: (scenario: ScenarioResult) => void;
}

export const IpVsOooComparison: React.FC<IpVsOooComparisonProps> = ({
  bestIp,
  bestOoo,
  distributeProfitsToOwner,
  onSelectScenario,
}) => {
  if (!bestIp && !bestOoo) return null;

  const ipProfit = bestIp
    ? distributeProfitsToOwner
      ? bestIp.netCashInHand
      : bestIp.netCompanyProfit
    : 0;

  const oooProfit = bestOoo
    ? distributeProfitsToOwner
      ? bestOoo.netCashInHand
      : bestOoo.netCompanyProfit
    : 0;

  const diff = ipProfit - oooProfit;
  const isIpWinner = diff > 0;
  const absDiff = Math.abs(diff);

  return (
    <div className="spectral-glass-panel p-4 sm:p-5 h-full flex flex-col justify-between space-y-3.5 relative overflow-hidden">
      {/* Top Header: Title + Delta badge */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
            <Scale className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Сравнение форм: ИП vs ООО
          </h3>
        </div>

        {bestIp && bestOoo && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-50 to-white text-slate-800 border border-slate-200 shadow-2xs">
            {isIpWinner ? (
              <span>
                ИП выгоднее на{' '}
                <strong className="text-emerald-700 font-black">{formatCompactRubles(absDiff)}</strong>
              </span>
            ) : diff < 0 ? (
              <span>
                ООО выгоднее на{' '}
                <strong className="text-purple-700 font-black">{formatCompactRubles(absDiff)}</strong>
              </span>
            ) : (
              <span>Результат равен</span>
            )}
          </span>
        )}
      </div>

      {/* Side-by-side compact comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 relative z-10">
        {/* ИП Card */}
        {bestIp ? (
          <div
            onClick={() => onSelectScenario(bestIp)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs ${
              isIpWinner
                ? 'bg-gradient-to-b from-blue-50/80 to-indigo-50/50 border-blue-400/90 shadow-[0_4px_14px_rgba(59,130,246,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-blue-400/40'
                : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-blue-100/80 text-blue-700">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  ИП
                </span>
                {isIpWinner && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs">
                    Лидер
                  </span>
                )}
              </div>

              <div className="font-bold text-slate-900 truncate">{bestIp.shortName}</div>
              <div className="text-[11px] text-slate-500 font-medium">{bestIp.vatDisplay}</div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-[11px] font-medium">Чистыми:</span>
                  <span className="font-extrabold text-blue-950 tabular-nums">
                    {formatCompactRubles(ipProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] font-medium">
                  <span>Эфф. ставка:</span>
                  <span className="font-bold text-slate-800">
                    {formatPercent(bestIp.effectiveTaxRate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-blue-200/60 text-[10px] font-medium text-blue-900 leading-tight">
              ✓ Вывод прибыли без налога на дивиденды (0% НДФЛ)
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
            Нет доступных сценариев для ИП
          </div>
        )}

        {/* ООО Card */}
        {bestOoo ? (
          <div
            onClick={() => onSelectScenario(bestOoo)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs ${
              !isIpWinner && diff !== 0
                ? 'bg-gradient-to-b from-purple-50/80 to-fuchsia-50/50 border-purple-400/90 shadow-[0_4px_14px_rgba(168,85,247,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-purple-400/40'
                : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-purple-100/80 text-purple-700">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  ООО
                </span>
                {!isIpWinner && diff !== 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xs">
                    Лидер
                  </span>
                )}
              </div>

              <div className="font-bold text-slate-900 truncate">{bestOoo.shortName}</div>
              <div className="text-[11px] text-slate-500 font-medium">{bestOoo.vatDisplay}</div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-[11px] font-medium">Чистыми:</span>
                  <span className="font-extrabold text-purple-950 tabular-nums">
                    {formatCompactRubles(oooProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] font-medium">
                  <span>Эфф. ставка:</span>
                  <span className="font-bold text-slate-800">
                    {formatPercent(bestOoo.effectiveTaxRate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-purple-200/60 text-[10px] font-medium text-purple-900 leading-tight">
              ✓ Защита личных активов (ответственность в пределах УК)
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
            Нет доступных сценариев для ООО
          </div>
        )}
      </div>
    </div>
  );
};
