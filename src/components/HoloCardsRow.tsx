import React from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { Check, Sparkles, Building2, User, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface HoloCardsRowProps {
  winner: ScenarioResult | null;
  bestIp: ScenarioResult | null;
  bestOoo: ScenarioResult | null;
  runnerUp: ScenarioResult | null;
  selectedScenarioId: string;
  distributeProfitsToOwner: boolean;
  onSelect: (scenario: ScenarioResult) => void;
}

export const HoloCardsRow: React.FC<HoloCardsRowProps> = ({
  winner,
  bestIp,
  bestOoo,
  runnerUp,
  selectedScenarioId,
  distributeProfitsToOwner,
  onSelect,
}) => {
  if (!winner) return null;

  // Decide on the 3 cards:
  // 1: Winner
  // 2: Best IP (or runner-up if winner is IP and bestOoo not applicable)
  // 3: Best OOO (or runner-up)
  const card1 = winner;
  const card2 = bestIp && bestIp.id !== winner.id ? bestIp : runnerUp || bestIp;
  const card3 = bestOoo && bestOoo.id !== winner.id ? bestOoo : (card2?.id !== runnerUp?.id ? runnerUp : null) || bestOoo;

  const cards = [
    {
      scenario: card1,
      tag: '№1 Выбор',
      role: 'Абсолютный лидер',
      cardClass: 'holo-card-personal',
      badgeClass: 'bg-white/90 text-slate-900 shadow-sm',
    },
    {
      scenario: card2,
      tag: card2?.orgForm === 'IP' ? 'ИП' : 'Альтернатива',
      role: card2?.orgForm === 'IP' ? 'Лучший для ИП' : 'Второй выбор',
      cardClass: 'holo-card-marketing',
      badgeClass: 'bg-white/90 text-slate-900 shadow-sm',
    },
    {
      scenario: card3,
      tag: card3?.orgForm === 'OOO' ? 'ООО' : 'Сравнение',
      role: card3?.orgForm === 'OOO' ? 'Лучший для ООО' : 'Альтернатива',
      cardClass: 'holo-card-ops',
      badgeClass: 'bg-white/90 text-slate-900 shadow-sm',
    },
  ].filter((c) => Boolean(c.scenario));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((item, index) => {
        const s = item.scenario!;
        const isSelected = selectedScenarioId === s.id;
        const profit = distributeProfitsToOwner ? s.netCashInHand : s.netCompanyProfit;
        const isWinner = s.id === winner.id;

        return (
          <div
            key={`${s.id}-${index}`}
            onClick={() => onSelect(s)}
            className={`group relative rounded-[28px] p-5.5 text-white cursor-pointer transition-all duration-300 select-none shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12),0_4px_12px_rgba(0,0,0,0.06)] border border-white/60 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-6px_rgba(15,23,42,0.18)] ${
              item.cardClass
            } ${isSelected ? 'ring-3 ring-indigo-600/80 ring-offset-2 ring-offset-slate-100' : ''}`}
          >
            {/* Holographic glossy sheen overlay */}
            <div className="absolute inset-0 holo-sheen-overlay pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Specular glass reflection line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[175px]">
              {/* Top Row: Title, Chip & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Credit card microchip simulation */}
                  <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 border border-amber-400/60 shadow-xs flex items-center justify-center p-0.5">
                    <div className="w-full h-full border border-amber-500/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-75">
                      <div className="border-r border-b border-amber-600/30" />
                      <div className="border-b border-amber-600/30" />
                      <div className="border-r border-amber-600/30" />
                      <div />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 drop-shadow-xs block">
                      {item.role}
                    </span>
                    <span className="text-xs font-bold text-white drop-shadow-sm flex items-center gap-1">
                      {s.orgForm === 'IP' ? (
                        <User className="w-3 h-3 text-white/80" />
                      ) : (
                        <Building2 className="w-3 h-3 text-white/80" />
                      )}
                      {s.shortName}
                    </span>
                  </div>
                </div>

                {/* Status Pill Badge (like Active pill in reference) */}
                <div className="flex items-center gap-1">
                  {isWinner ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-slate-900 shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Победитель
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/20 text-white backdrop-blur-md border border-white/30">
                      {s.orgForm}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle info: VAT status */}
              <div className="my-2">
                <div className="text-[11px] text-white/85 font-medium drop-shadow-xs">
                  НДС: {s.vatDisplay}
                </div>
              </div>

              {/* Bottom Row: Profit Number + Mastercard circles simulation */}
              <div className="pt-2 border-t border-white/25 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                    {distributeProfitsToOwner ? 'Чистыми на руках' : 'Чистая прибыль'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm tabular-nums">
                    {formatRubles(profit)}
                  </div>
                  <div className="text-[10px] font-medium text-white/90 drop-shadow-xs">
                    Эфф. ставка: {formatPercent(s.effectiveTaxRate)}
                  </div>
                </div>

                {/* Twin circles emblem (Mastercard aesthetic from reference) */}
                <div className="flex items-center -space-x-2 shrink-0 opacity-90">
                  <div className="w-6 h-6 rounded-full bg-red-500/80 shadow-xs backdrop-blur-xs" />
                  <div className="w-6 h-6 rounded-full bg-amber-400/80 shadow-xs backdrop-blur-xs" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
