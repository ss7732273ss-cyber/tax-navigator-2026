import React from 'react';

interface FooterProps {
  version: string;
}

export const Footer: React.FC<FooterProps> = ({ version }) => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 mt-12 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <span className="font-semibold text-slate-700">
            © 2026 Светлана Колтышева.
          </span>{' '}
          <span className="text-slate-500">Создано с использованием AI-инструментов.</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-medium">
          <span>База законодательства: НК РФ 2026 ({version})</span>
          <span>•</span>
          <span className="text-indigo-600 font-semibold">Детерминированное расчётное ядро</span>
        </div>
      </div>
    </footer>
  );
};
