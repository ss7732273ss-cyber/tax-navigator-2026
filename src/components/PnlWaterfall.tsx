import React from 'react';
import { ScenarioResult } from '../types';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { AlertCircle, Layers } from 'lucide-react';

interface PnlWaterfallProps {
  scenario: ScenarioResult | null;
  distributeProfitsToOwner: boolean;
}

export const PnlWaterfall: React.FC<PnlWaterfallProps> = ({
  scenario,
  distributeProfitsToOwner,
}) => {
  if (!scenario) return null;

  const isOoo = scenario.orgForm === 'OOO';
  const finalProfit = distributeProfitsToOwner ? scenario.netCashInHand : scenario.netCompanyProfit;

  const rev = Math.max(1, scenario.revenueGross);
  const vatPct = Math.min(100, Math.round((scenario.vatOutput / rev) * 100));
  const expPct = Math.min(
    100,
    Math.round(((scenario.variableExpensesNet + scenario.fixedExpensesNet) / rev) * 100)
  );
  const payrollPct = Math.min(
    100,
    Math.round(((scenario.ipSelfContributions + scenario.employeeTaxes) / rev) * 100)
  );
  const taxPct = Math.min(100, Math.round((scenario.regimeTaxPayable / rev) * 100));
  const profitPct = Math.max(0, Math.min(100, Math.round((finalProfit / rev) * 100)));

  const flowSegments = [
    { label: 'НДС', pct: vatPct, color: 'bg-rose-500', amount: scenario.vatOutput },
    {
      label: 'Расходы',
      pct: expPct,
      color: 'bg-slate-500',
      amount: scenario.variableExpensesNet + scenario.fixedExpensesNet,
    },
    {
      label: 'Взносы',
      pct: payrollPct,
      color: 'bg-amber-500',
      amount: scenario.ipSelfContributions + scenario.employeeTaxes,
    },
    { label: 'Налог режима', pct: taxPct, color: 'bg-purple-600', amount: scenario.regimeTaxPayable },
    { label: 'Чистыми', pct: profitPct, color: 'bg-emerald-500', amount: finalProfit },
  ];

  return (
    <div className="spectral-glass-panel p-4 sm:p-5 space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-900">
              Детализация P&L: {scenario.orgForm === 'IP' ? 'ИП' : 'ООО'} • {scenario.shortName}
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
              {scenario.vatDisplay}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Пошаговый каскад формирования чистой прибыли от выручки брутто
          </p>
        </div>

        <div className="sm:text-right bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 px-3.5 py-1.5 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            {distributeProfitsToOwner ? 'Чистыми на руках' : 'Чистая прибыль'}
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-700 tabular-nums">
            {formatRubles(finalProfit)}
          </span>
        </div>
      </div>

      {/* Proportional Cashflow Bar */}
      <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-600">
            Структура распределения выручки брутто ({formatCompactRubles(scenario.revenueGross)})
          </span>
          <span className="text-slate-400 font-medium text-[11px]">100% выручки</span>
        </div>

        {/* Stacked Bar */}
        <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
          {flowSegments.map(
            (seg, idx) =>
              seg.pct > 0 && (
                <div
                  key={idx}
                  style={{ width: `${seg.pct}%` }}
                  className={`${seg.color} transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer`}
                  title={`${seg.label}: ${formatRubles(seg.amount)} (${seg.pct}%)`}
                />
              )
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1">
          {flowSegments.map(
            (seg, idx) =>
              seg.pct > 0 && (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${seg.color}`} />
                  <span className="text-slate-600 font-medium">{seg.label}:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCompactRubles(seg.amount)} ({seg.pct}%)
                  </span>
                </div>
              )
          )}
        </div>
      </div>

      {/* Ineligible alert if applicable */}
      {scenario.eligibility.status === 'INELIGIBLE' && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{scenario.eligibility.reasonTitle}:</span>{' '}
            <span>{scenario.eligibility.reasonDetails}</span>
          </div>
        </div>
      )}

      {/* Waterfall Rows */}
      <div className="space-y-1.5 text-xs">
        {/* 1. Выручка брутто */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white font-bold text-slate-900 border border-slate-200">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            1. Выручка от покупателей (брутто, с НДС)
          </span>
          <span className="tabular-nums font-extrabold">{formatRubles(scenario.revenueGross)}</span>
        </div>

        {/* 2. Исходящий НДС */}
        {scenario.vatOutput > 0 ? (
          <div className="flex items-center justify-between p-2 rounded-lg text-rose-700 pl-5 border-l-2 border-rose-400 bg-rose-50/20">
            <span className="font-medium">
              (–) Исходящий НДС покупателей ({scenario.vatDisplay})
            </span>
            <span className="tabular-nums font-bold">–{formatRubles(scenario.vatOutput)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-lg text-slate-500 pl-5 border-l-2 border-slate-200">
            <span className="font-medium">НДС не начисляется (Освобождение по ст. 145 или АУСН)</span>
            <span className="tabular-nums font-semibold">0 ₽</span>
          </div>
        )}

        {/* 3. Очищенная выручка */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/50 font-bold text-indigo-950 border border-indigo-100">
          <span>(=) Чистая выручка бизнеса (без исходящего НДС)</span>
          <span className="tabular-nums font-extrabold">{formatRubles(scenario.revenueNet)}</span>
        </div>

        {/* 4. Переменные расходы */}
        <div className="flex items-center justify-between p-2 rounded-lg text-slate-700 pl-5 border-l-2 border-slate-300">
          <div>
            <span className="font-medium">(–) Переменные расходы (закупки, сырье)</span>
            {scenario.vatVariant === 'STANDARD_22' && (
              <span className="block text-[10px] text-slate-400">
                Очищены от входящего НДС 22% (принят к вычету)
              </span>
            )}
          </div>
          <span className="tabular-nums font-bold text-rose-700">
            –{formatRubles(scenario.variableExpensesNet)}
          </span>
        </div>

        {/* 5. Валовая прибыль */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-bold text-slate-900 border border-slate-200">
          <span>(=) Валовая прибыль</span>
          <span className="tabular-nums font-extrabold">{formatRubles(scenario.grossProfit)}</span>
        </div>

        {/* 6. Постоянные расходы */}
        <div className="flex items-center justify-between p-2 rounded-lg text-slate-700 pl-5 border-l-2 border-slate-300">
          <div>
            <span className="font-medium">(–) Постоянные расходы (аренда, сервисы, маркетинг)</span>
            {scenario.vatVariant === 'STANDARD_22' && (
              <span className="block text-[10px] text-slate-400">
                Очищены от входящего НДС 22%
              </span>
            )}
          </div>
          <span className="tabular-nums font-bold text-rose-700">
            –{formatRubles(scenario.fixedExpensesNet)}
          </span>
        </div>

        {/* 7. Операционная прибыль */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-bold text-slate-900 border border-slate-200">
          <span>(=) Операционная прибыль (EBITDA-приближение)</span>
          <span className="tabular-nums font-extrabold">
            {formatRubles(scenario.operatingProfit)}
          </span>
        </div>

        {/* 8. Страховые взносы */}
        <div className="space-y-1 pl-5 border-l-2 border-amber-300">
          {scenario.ipSelfContributions > 0 && (
            <div className="flex items-center justify-between py-0.5 text-slate-700">
              <span className="font-medium">
                (–) Страховые взносы ИП за себя (фикс 57 390 ₽ + 1% свыше 300 тыс. ₽)
              </span>
              <span className="tabular-nums font-bold text-rose-700">
                –{formatRubles(scenario.ipSelfContributions)}
              </span>
            </div>
          )}
          {scenario.employeeTaxes > 0 && (
            <div className="flex items-center justify-between py-0.5 text-slate-700">
              <span className="font-medium">
                (–) Страховые взносы за сотрудников
                {scenario.regime.startsWith('AUSN') && ' (фикс. травматизм 2 959 ₽)'}
              </span>
              <span className="tabular-nums font-bold text-rose-700">
                –{formatRubles(scenario.employeeTaxes)}
              </span>
            </div>
          )}
        </div>

        {/* 9. Налог режима */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>(–) Налог применяемого режима к уплате</span>
            <span className="tabular-nums text-rose-700 font-extrabold">
              –{formatRubles(scenario.regimeTaxPayable)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div>• Исчисленный налог до вычета: {formatRubles(scenario.calculatedRegimeTax)}</div>
            {scenario.taxDeduction > 0 && (
              <div className="text-emerald-700 font-semibold">
                • Вычет взносов:{' '}
                {scenario.orgForm === 'IP' && scenario.employeeTaxes === 0
                  ? '100% налога уменьшено на взносы ИП'
                  : 'уменьшение налога на 50%'}{' '}
                (–{formatRubles(scenario.taxDeduction)})
              </div>
            )}
            {scenario.isMinimumTaxApplied && (
              <div className="text-amber-700 font-bold">
                • Внимание: сработал минимальный налог 1% от выручки (ст. 346.18 НК РФ)
              </div>
            )}
          </div>
        </div>

        {/* 10. НДС к уплате (если есть вычет входного) */}
        {scenario.vatVariant === 'STANDARD_22' && (
          <div className="flex items-center justify-between p-2 rounded-lg text-slate-700 pl-5 border-l-2 border-indigo-300 text-[11px] bg-indigo-50/20">
            <span className="font-medium">
              Справка по НДС 22%: Исходящий ({formatCompactRubles(scenario.vatOutput)}) – Вычет входного (
              {formatCompactRubles(scenario.vatInput)})
            </span>
            <span className="tabular-nums font-bold">
              = {formatRubles(scenario.vatPayable)} к уплате
            </span>
          </div>
        )}

        {/* 11. Чистая прибыль бизнеса */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 font-bold text-emerald-950">
          <span>(=) Чистая прибыль бизнеса (на расчетном счете компании / ИП)</span>
          <span className="tabular-nums text-sm font-extrabold">
            {formatRubles(scenario.netCompanyProfit)}
          </span>
        </div>

        {/* 12. Налог на дивиденды (для ООО) */}
        {isOoo && distributeProfitsToOwner && (
          <div className="space-y-1 pl-5 border-l-2 border-purple-300">
            <div className="flex items-center justify-between py-1 text-slate-700">
              <div>
                <span className="font-medium">
                  (–) НДФЛ с дивидендов собственника (13% до 2,4 млн ₽, 15% свыше)
                </span>
                <span className="block text-[10px] text-slate-400">
                  Двухступенчатая шкала ст. 224 НК РФ
                </span>
              </div>
              <span className="tabular-nums font-bold text-rose-700">
                –{formatRubles(scenario.dividendTax)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm">
              <span>(=) Чистые деньги на руках у собственника</span>
              <span className="tabular-nums text-base">{formatRubles(scenario.netCashInHand)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tax Summary Micro Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Всего налогов
          </div>
          <div className="font-bold text-slate-900 tabular-nums text-xs mt-0.5">
            {formatCompactRubles(scenario.totalTaxBurden)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Эфф. ставка
          </div>
          <div className="font-bold text-indigo-700 tabular-nums text-xs mt-0.5">
            {formatPercent(scenario.effectiveTaxRate)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            НДС в бюджет
          </div>
          <div className="font-bold text-slate-900 tabular-nums text-xs mt-0.5">
            {formatCompactRubles(scenario.vatPayable)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Взносы всего
          </div>
          <div className="font-bold text-slate-900 tabular-nums text-xs mt-0.5">
            {formatCompactRubles(scenario.ipSelfContributions + scenario.employeeTaxes)}
          </div>
        </div>
      </div>
    </div>
  );
};
