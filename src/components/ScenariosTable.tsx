import React, { useState } from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Info,
} from 'lucide-react';

interface ScenariosTableProps {
  scenarios: ScenarioResult[];
  selectedScenario: ScenarioResult | null;
  winner?: ScenarioResult | null;
  searchQuery?: string;
  distributeProfitsToOwner: boolean;
  onSelectScenario: (scenario: ScenarioResult) => void;
}

export const ScenariosTable: React.FC<ScenariosTableProps> = ({
  scenarios,
  selectedScenario,
  winner,
  searchQuery = '',
  distributeProfitsToOwner,
  onSelectScenario,
}) => {
  const [filterForm, setFilterForm] = useState<'ALL' | 'IP' | 'OOO'>('ALL');
  const [showIneligible, setShowIneligible] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  const filtered = scenarios.filter((s) => {
    if (filterForm !== 'ALL' && s.orgForm !== filterForm) return false;
    if (!showIneligible && s.eligibility.status === 'INELIGIBLE') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.regime.toLowerCase().includes(q) ||
        s.vatDisplay.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const renderStatusBadge = (s: ScenarioResult) => {
    const { status, reasonTitle, checklist } = s.eligibility;

    if (s.id === winner?.id && status !== 'INELIGIBLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 text-emerald-800 border border-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.25)] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
          <span>Оптимум</span>
        </span>
      );
    }

    if (status === 'ELIGIBLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50/90 text-emerald-700 border border-emerald-300/80 shadow-2xs whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Доступен</span>
        </span>
      );
    }

    if (status === 'WARNING') {
      return (
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedChecklistId(expandedChecklistId === s.id ? null : s.id);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300/90 hover:bg-amber-100 transition shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Оговорки</span>
            {checklist && <ChevronDown className="w-2.5 h-2.5 ml-0.5 shrink-0" />}
          </button>

          {/* Checklist popover with safe positioning */}
          {expandedChecklistId === s.id && checklist && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 sm:left-0 mt-1.5 z-30 w-72 sm:w-80 p-3.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 text-xs text-slate-700 space-y-2.5 ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Условия применения (АУСН)
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedChecklistId(null)}
                  className="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{reasonTitle}</p>
              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className={`font-bold shrink-0 mt-0.5 ${item.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.passed ? '✓' : '⚠'}
                    </span>
                    <span className="leading-tight text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // INELIGIBLE
    return (
      <span
        title={reasonTitle || 'Неприменим по нормам НК РФ'}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs whitespace-nowrap"
      >
        <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
        <span>Неприменим</span>
      </span>
    );
  };

  return (
    <div className="spectral-glass-panel rounded-3xl overflow-hidden relative shadow-sm">
      {/* Specular top border highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      {/* Table Toolbar & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Сравнительная матрица налоговых сценариев
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ранжирование режимов по итоговой чистой отдаче с учётом НДС и взносов
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/60 border border-slate-300/50 shadow-inner text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                viewMode === 'table'
                  ? 'tactile-pill-active'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Таблица</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                viewMode === 'cards'
                  ? 'tactile-pill-active'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Карточки</span>
            </button>
          </div>

          {/* Form Filter Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/60 border border-slate-300/50 shadow-inner text-xs font-semibold">
            {(['ALL', 'IP', 'OOO'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterForm(f)}
                className={`px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  filterForm === f
                    ? 'tactile-pill-active'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {f === 'ALL' ? 'Все' : f === 'IP' ? 'ИП' : 'ООО'}
              </button>
            ))}
          </div>

          {/* Toggle Ineligible */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none bg-white/80 px-3 py-1.5 rounded-2xl border border-slate-200/80 hover:bg-white transition-all shadow-xs">
            <input
              type="checkbox"
              checked={showIneligible}
              onChange={(e) => setShowIneligible(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
            />
            <span>Показывать неприменимые</span>
          </label>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW - Fully responsive, cleanly proportioned, no clipping on right */}
      {viewMode === 'table' ? (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Налоговый режим</th>
                <th className="py-3.5 px-2 text-center w-16">Форма</th>
                <th className="py-3.5 px-2 text-center w-24">НДС 2026</th>
                <th className="py-3.5 px-3 text-center w-32">Статус НК</th>
                <th className="py-3.5 px-3 text-right w-28">Налог режима</th>
                <th className="py-3.5 px-3 text-right w-28">НДС в бюджет</th>
                <th className="py-3.5 px-3 text-right w-28">Взносы</th>
                <th className="py-3.5 px-4 text-right w-40 text-slate-900 font-extrabold">
                  {distributeProfitsToOwner ? 'Чистыми на руках' : 'Чистая прибыль'}
                </th>
                <th className="py-3.5 px-3 text-right w-24">Эфф. ставка</th>
                <th className="py-3.5 px-3 text-center w-14">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const isSelected = selectedScenario?.id === s.id;
                const isBlocked = s.eligibility.status === 'INELIGIBLE';
                const mainProfit = distributeProfitsToOwner ? s.netCashInHand : s.netCompanyProfit;

                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectScenario(s)}
                    className={`transition-all duration-150 cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50/90 font-medium shadow-inner'
                        : isBlocked
                        ? 'bg-slate-50/30 opacity-60 hover:opacity-90 hover:bg-slate-50/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Scenario Name with reference-style status dot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {/* Circular status indicator matching reference */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-600 border border-rose-200'
                              : isSelected
                              ? 'bg-indigo-600 text-white shadow-[0_2px_6px_rgba(79,70,229,0.3)]'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isBlocked ? (
                            <span className="text-xs font-black">!</span>
                          ) : (
                            <span className="text-xs font-black">✓</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-extrabold tracking-tight ${
                                isSelected ? 'text-indigo-950 font-black' : 'text-slate-900'
                              }`}
                            >
                              {s.shortName}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-2xs">
                                Выбран
                              </span>
                            )}
                          </div>
                          {isBlocked && (
                            <div className="text-[11px] text-rose-600 mt-0.5 line-clamp-1 font-medium">
                              {s.eligibility.reasonTitle}: {s.eligibility.reasonDetails}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Org Form */}
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] shadow-2xs whitespace-nowrap ${
                          s.orgForm === 'IP'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200/70'
                            : 'bg-purple-50 text-purple-800 border border-purple-200/70'
                        }`}
                      >
                        {s.orgForm === 'IP' ? 'ИП' : 'ООО'}
                      </span>
                    </td>

                    {/* VAT */}
                    <td className="py-3 px-2 text-center">
                      <span className="inline-block text-slate-700 text-[11px] font-semibold bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/70 shadow-2xs whitespace-nowrap">
                        {s.vatDisplay}
                      </span>
                    </td>

                    {/* Eligibility Status */}
                    <td className="py-3 px-2 text-center">
                      {renderStatusBadge(s)}
                    </td>

                    {/* Regime Tax */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-medium whitespace-nowrap">
                      {formatCompactRubles(s.regimeTaxPayable)}
                      {s.isMinimumTaxApplied && (
                        <span className="block text-[10px] text-amber-600 font-bold">
                          (мин. налог)
                        </span>
                      )}
                    </td>

                    {/* VAT Payable */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-medium whitespace-nowrap">
                      {formatCompactRubles(s.vatPayable)}
                    </td>

                    {/* Contributions */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-medium whitespace-nowrap">
                      {formatCompactRubles(s.ipSelfContributions + s.employeeTaxes)}
                    </td>

                    {/* Net Cash in Hand / Net Profit */}
                    <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                      <div
                        className={`text-sm font-extrabold tracking-tight ${
                          isBlocked
                            ? 'text-slate-400 line-through'
                            : mainProfit >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {formatRubles(mainProfit)}
                      </div>
                      {distributeProfitsToOwner && s.orgForm === 'OOO' && s.dividendTax > 0 && (
                        <div className="text-[10px] text-slate-400 font-medium">
                          –{formatCompactRubles(s.dividendTax)} НДФЛ
                        </div>
                      )}
                    </td>

                    {/* Effective Rate */}
                    <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">
                      <span
                        className={`font-bold text-[11px] px-2 py-0.5 rounded-md ${
                          isBlocked
                            ? 'text-slate-400'
                            : 'text-slate-800 bg-slate-100/90'
                        }`}
                      >
                        {isBlocked ? '—' : formatPercent(s.effectiveTaxRate)}
                      </span>
                    </td>

                    {/* Action Button (Never clipped on right) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScenario(s);
                        }}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-white shadow-2xs border border-transparent hover:border-slate-200'
                        }`}
                        title="Посмотреть детальный P&L"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* VIEW 2: CARDS GRID VIEW - Inspired by the 3 iridescent cards in the reference */
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const isSelected = selectedScenario?.id === s.id;
            const isBlocked = s.eligibility.status === 'INELIGIBLE';
            const mainProfit = distributeProfitsToOwner ? s.netCashInHand : s.netCompanyProfit;

            return (
              <div
                key={s.id}
                onClick={() => onSelectScenario(s)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/80 border-indigo-400/80 ring-2 ring-indigo-500/20 shadow-md'
                    : isBlocked
                    ? 'bg-slate-50/50 border-slate-200/70 opacity-65 hover:opacity-95'
                    : 'bg-gradient-to-br from-white via-white to-slate-50/60 border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          s.orgForm === 'IP'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200/70'
                            : 'bg-purple-50 text-purple-800 border border-purple-200/70'
                        }`}
                      >
                        {s.orgForm === 'IP' ? 'ИП' : 'ООО'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {s.vatDisplay}
                      </span>
                    </div>

                    <div>{renderStatusBadge(s)}</div>
                  </div>

                  {/* Scenario Name */}
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {s.shortName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {s.vatVariant === 'EXEMPT_145'
                      ? 'Освобождение от НДС (ст. 145)'
                      : s.vatVariant === 'SPECIAL_5'
                      ? 'Специальная ставка НДС 5%'
                      : s.vatVariant === 'SPECIAL_7'
                      ? 'Специальная ставка НДС 7%'
                      : s.vatVariant === 'STANDARD_22'
                      ? 'Общая ставка НДС 22% с правом вычетов'
                      : 'Без НДС'}
                  </p>

                  {/* Financial Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-2 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 font-medium">
                        {distributeProfitsToOwner ? 'Чистыми на руках:' : 'Чистая прибыль:'}
                      </span>
                      <span
                        className={`text-base font-extrabold tabular-nums ${
                          isBlocked
                            ? 'text-slate-400 line-through'
                            : mainProfit >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {formatRubles(mainProfit)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Налог режима:</span>
                      <span className="font-semibold tabular-nums">
                        {formatCompactRubles(s.regimeTaxPayable)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>НДС к уплате:</span>
                      <span className="font-semibold tabular-nums">
                        {formatCompactRubles(s.vatPayable)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Эффективная ставка:</span>
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {isBlocked ? '—' : formatPercent(s.effectiveTaxRate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Всего сборов: {formatCompactRubles(s.totalTaxBurden)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScenario(s);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <span>{isSelected ? 'Выбран' : 'Смотреть P&L'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
