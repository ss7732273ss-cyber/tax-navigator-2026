import React, { useState } from 'react';
import { LegislationParams } from '../types';
import { DEFAULT_LEGISLATION_2026 } from '../config/legislation2026';
import { formatCompactRubles, formatPercent, formatRubles } from '../utils/formatters';
import { X, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface LegislationModalProps {
  isOpen: boolean;
  legislation: LegislationParams;
  onClose: () => void;
  onSave: (updated: LegislationParams) => void;
  onReset: () => void;
}

export const LegislationModal: React.FC<LegislationModalProps> = ({
  isOpen,
  legislation,
  onClose,
  onSave,
  onReset,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<LegislationParams>({ ...legislation });

  const update = <K extends keyof LegislationParams>(key: K, value: LegislationParams[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      ...form,
      version: '2026.1-CUSTOM',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] border border-slate-200/90 ring-1 ring-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Законодательные параметры и лимиты НК РФ
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Версия базы: {legislation.version} (НК РФ, редакция 2026 года)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section: УСН */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-1">
              1. Упрощенная система налогообложения (УСН, гл. 26.2 НК РФ)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Лимит дохода в 2026 г. с коэфф.-дефлятором (руб.)
                </label>
                <input
                  type="number"
                  value={form.usnMaxRevenue}
                  onChange={(e) => update('usnMaxRevenue', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">
                  Эталон: 490 500 000 ₽ (дефлятор 1.090)
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Лимит сотрудников УСН (чел.)
                </label>
                <input
                  type="number"
                  value={form.usnMaxEmployees}
                  onChange={(e) => update('usnMaxEmployees', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 130 сотрудников</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Ставка УСН «Доходы»
                </label>
                <input
                  type="number"
                  step={0.01}
                  value={form.usnIncomeRate}
                  onChange={(e) => update('usnIncomeRate', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 0.06 (6%)</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Ставка УСН «Доходы минус Расходы»
                </label>
                <input
                  type="number"
                  step={0.01}
                  value={form.usnExpenseRate}
                  onChange={(e) => update('usnExpenseRate', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 0.15 (15%)</span>
              </div>
            </div>
          </div>

          {/* Section: НДС */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-1">
              2. Налог на добавленную стоимость (НДС 2026 г., ст. 145 и ст. 164 НК РФ)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Порог автоосвобождения по ст. 145 НК РФ (руб.)
                </label>
                <input
                  type="number"
                  value={form.vatExemptionThreshold}
                  onChange={(e) => update('vatExemptionThreshold', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 20 000 000 ₽</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Порог перехода со ставки 5% на 7% в 2026 г. (руб.)
                </label>
                <input
                  type="number"
                  value={form.vatTier1Threshold2026}
                  onChange={(e) => update('vatTier1Threshold2026', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">
                  Эталон: 272 500 000 ₽ (дефлятор 1.090)
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Специальная ставка НДС 1 ступени (без вычетов)
                </label>
                <input
                  type="number"
                  step={0.01}
                  value={form.vatTier1Rate}
                  onChange={(e) => update('vatTier1Rate', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 0.05 (5%)</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Специальная ставка НДС 2 ступени (без вычетов)
                </label>
                <input
                  type="number"
                  step={0.01}
                  value={form.vatTier2Rate}
                  onChange={(e) => update('vatTier2Rate', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 0.07 (7%)</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Общеустановленная ставка НДС с 01.01.2026 (с вычетами)
                </label>
                <input
                  type="number"
                  step={0.01}
                  value={form.vatStandardRate}
                  onChange={(e) => update('vatStandardRate', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 0.22 (22%)</span>
              </div>
            </div>
          </div>

          {/* Section: АУСН и Страховые взносы */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-1">
              3. АУСН (ФЗ № 17-ФЗ) и Страховые взносы ИП (ст. 430 НК РФ)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Лимит дохода АУСН (руб.)
                </label>
                <input
                  type="number"
                  value={form.ausnMaxRevenue}
                  onChange={(e) => update('ausnMaxRevenue', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 60 000 000 ₽</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Фиксированный взнос на травматизм АУСН (руб./год)
                </label>
                <input
                  type="number"
                  value={form.ausnInjuryContribution}
                  onChange={(e) => update('ausnInjuryContribution', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон 2026 г.: 2 959 ₽</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Фиксированные взносы ИП за себя 2026 г. (руб.)
                </label>
                <input
                  type="number"
                  value={form.ipFixedContribution}
                  onChange={(e) => update('ipFixedContribution', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 57 390 ₽</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Максимальный размер взносов ИП за себя (руб.)
                </label>
                <input
                  type="number"
                  value={form.ipMaxTotalContribution}
                  onChange={(e) => update('ipMaxTotalContribution', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Эталон: 379 208 ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onReset();
              setForm({ ...DEFAULT_LEGISLATION_2026 });
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Восстановить эталон 2026 г.
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white tactile-btn-primary rounded-xl transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Применить параметры
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
