import React from 'react';
import { Scale, Settings2, RotateCcw, AlertTriangle } from 'lucide-react';
import { LegislationParams } from '../types';

interface HeaderProps {
  legislation: LegislationParams;
  isCustomLegislation: boolean;
  onOpenLegislation: () => void;
  onResetLegislation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  legislation,
  isCustomLegislation,
  onOpenLegislation,
  onResetLegislation,
}) => {
  return (
    <header className="border-b border-white/60 bg-white/75 backdrop-blur-2xl sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-1 ring-white/60">
            <Scale className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Налоговый навигатор
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 shadow-xs backdrop-blur-sm">
                2026 г.
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Сравнительный анализ и фискальный аудит налоговых режимов ИП и ООО
            </p>
          </div>
        </div>

        {/* Legislation info & settings trigger */}
        <div className="flex items-center gap-2.5">
          {isCustomLegislation && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/90 text-amber-900 border border-amber-300/80 text-xs shadow-xs backdrop-blur-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold">Кастомные параметры</span>
              <button
                type="button"
                onClick={onResetLegislation}
                title="Сбросить к эталону 2026 г."
                className="ml-1 text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Сброс
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenLegislation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs hover:shadow-sm active:scale-[0.98] backdrop-blur-md transition-all duration-150 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Параметры НК РФ ({legislation.version})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
