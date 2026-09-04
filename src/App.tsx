import React, { useMemo, useState } from 'react';
import { BusinessProfile, LegislationParams, ScenarioResult } from './types';
import { DEFAULT_LEGISLATION_2026 } from './config/legislation2026';
import { generateAndCalculateAllScenarios } from './engine/navigatorCore';
import { BusinessForm } from './components/BusinessForm';
import { WinnerCard } from './components/WinnerCard';
import { IpVsOooComparison } from './components/IpVsOooComparison';
import { AlternativeBenchmarkCard } from './components/AlternativeBenchmarkCard';
import { ScenariosTable } from './components/ScenariosTable';
import { PnlWaterfall } from './components/PnlWaterfall';
import { MetalStressCard } from './components/MetalStressCard';
import { LegislationModal } from './components/LegislationModal';
import { Footer } from './components/Footer';
import {
  Scale,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  Table,
  Sliders,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  // Законодательная база (по умолчанию официальный 2026 г.)
  const [legislation, setLegislation] = useState<LegislationParams>(DEFAULT_LEGISLATION_2026);
  const [isLegislationModalOpen, setIsLegislationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'IP' | 'OOO'>('ALL');

  // Профиль бизнеса (по умолчанию — растущий бизнес с оборотом 45 млн ₽)
  const [profile, setProfile] = useState<BusinessProfile>({
    orgForm: 'BOTH',
    originStatus: 'EXISTING_USN',
    priorYearRevenueBand: 'FROM_20M_TO_250M',
    revenueGross: 45_000_000,
    useMonthlyDistribution: false,
    variableExpensesGross: 24_000_000,
    variableVatShare: 0.40,
    fixedExpensesGross: 6_000_000,
    fixedVatShare: 0.30,
    employeeCount: 4,
    employeePayrollTaxes: 480_000,
    distributeProfitsToOwner: true,
  });

  // Выбранный пользователем сценарий для детального изучения P&L
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Расчет всех сценариев в детерминированном ядре
  const calculation = useMemo(() => {
    return generateAndCalculateAllScenarios(profile, legislation);
  }, [profile, legislation]);

  const { scenarios, winner, bestIp, bestOoo } = calculation;

  // Определение второго лучшего сценария и ОСНО для сравнительных бейджей
  const validScenarios = useMemo(() => {
    return scenarios.filter((s) => s.eligibility.status !== 'INELIGIBLE');
  }, [scenarios]);

  const runnerUp = useMemo(() => {
    if (!winner || validScenarios.length < 2) return null;
    return validScenarios.find((s) => s.id !== winner.id) || null;
  }, [winner, validScenarios]);

  const osnoScenario = useMemo(() => {
    return (
      validScenarios.find(
        (s) => s.regime === 'OSNO' && (winner ? s.orgForm === winner.orgForm : true)
      ) ||
      validScenarios.find((s) => s.regime === 'OSNO') ||
      null
    );
  }, [validScenarios, winner]);

  // Выбранный сценарий: если не выбран вручную — по умолчанию победитель
  const activeScenario = useMemo(() => {
    if (selectedScenarioId) {
      const found = scenarios.find((s) => s.id === selectedScenarioId);
      if (found) return found;
    }
    return winner || scenarios[0] || null;
  }, [selectedScenarioId, scenarios, winner]);

  const handleQuickFilter = (type: typeof quickFilter) => {
    setQuickFilter(type);
    if (type === 'IP') {
      setProfile((p) => ({ ...p, orgForm: 'IP' }));
    } else if (type === 'OOO') {
      setProfile((p) => ({ ...p, orgForm: 'OOO' }));
    } else if (type === 'ALL') {
      setProfile((p) => ({ ...p, orgForm: 'BOTH' }));
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isCustomLegislation = JSON.stringify(legislation) !== JSON.stringify(DEFAULT_LEGISLATION_2026);

  return (
    <div className="min-h-screen blueprint-grid py-4 sm:py-6 px-3 sm:px-6 lg:px-8 flex justify-center items-start selection:bg-indigo-600 selection:text-white">
      {/* Master Analytical Dashboard Slab */}
      <div className="max-w-7xl w-full master-glass-slab rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 space-y-6 relative">
        {/* Specular top light rim */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* TOP HEADER: Calm, Executive, Clean with volumetric touches */}
        <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-md border border-indigo-500/30 relative overflow-hidden shrink-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
              <Scale className="w-5 h-5 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.6)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Налоговый навигатор
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-sky-50 text-indigo-900 border border-indigo-200/80 shadow-2xs">
                  НК РФ 2026
                </span>
                {isCustomLegislation && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300/90 shadow-2xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Кастомные ставки
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Аналитический аудит налоговых режимов ИП и ООО с учётом реформы УСН и НДС
              </p>
            </div>
          </div>

          {/* Quick Navigation Anchors & Legislation Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl border border-slate-300/60 shadow-inner text-xs font-semibold">
              <button
                type="button"
                onClick={() => scrollToSection('parameters-section')}
                className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
              >
                1. Параметры
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('results-section')}
                className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
              >
                2. Итоги
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('matrix-section')}
                className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
              >
                3. Матрица
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('waterfall-section')}
                className="px-2.5 py-1 rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
              >
                4. P&L / Стресс
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setIsLegislationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 hover:to-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold shadow-xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Параметры НК РФ</span>
            </button>
          </div>
        </header>

        {/* =========================================================
            1. ВХОДНЫЕ ПАРАМЕТРЫ БИЗНЕСА (ЕСТЕСТВЕННАЯ СТАРТОВАЯ ТОЧКА)
            ========================================================= */}
        <section id="parameters-section" className="relative z-10 scroll-mt-20">
          <BusinessForm profile={profile} onChange={setProfile} />
        </section>

        {/* =========================================================
            2. ИТОГИ РАСЧЁТА И РЕКОМЕНДАЦИЯ (АКЦЕНТ ЦВЕТОМ/РАМКОЙ, НЕ РАЗМЕРОМ)
            ========================================================= */}
        <section id="results-section" className="relative z-10 space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
                <Sparkles className="w-3.5 h-3.5 drop-shadow-xs" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                2. Итоги расчёта и рекомендация
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Автоматический расчёт с учётом лимита 450 млн ₽ и порога НДС 60 млн ₽
            </span>
          </div>

          {/* Balanced 2-card Executive Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Primary Winner Recommendation Card */}
            <div className="lg:col-span-7">
              <WinnerCard
                winner={winner}
                runnerUp={runnerUp}
                osnoScenario={osnoScenario}
                distributeProfitsToOwner={profile.distributeProfitsToOwner}
                onSelect={(s) => {
                  setSelectedScenarioId(s.id);
                  scrollToSection('waterfall-section');
                }}
              />
            </div>

            {/* Comparative IP vs OOO or Alternative Benchmark Card */}
            <div className="lg:col-span-5">
              {profile.orgForm === 'BOTH' ? (
                <IpVsOooComparison
                  bestIp={bestIp}
                  bestOoo={bestOoo}
                  distributeProfitsToOwner={profile.distributeProfitsToOwner}
                  onSelectScenario={(s) => {
                    setSelectedScenarioId(s.id);
                    scrollToSection('waterfall-section');
                  }}
                />
              ) : (
                <AlternativeBenchmarkCard
                  winner={winner}
                  osnoScenario={osnoScenario}
                  runnerUp={runnerUp}
                  distributeProfitsToOwner={profile.distributeProfitsToOwner}
                  onSelectScenario={(s) => {
                    setSelectedScenarioId(s.id);
                    scrollToSection('waterfall-section');
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
            3. СРАВНИТЕЛЬНАЯ МАТРИЦА ВСЕХ НАЛОГОВЫХ РЕЖИМОВ 2026
            ========================================================= */}
        <section id="matrix-section" className="relative z-10 space-y-3 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
                <Table className="w-3.5 h-3.5 drop-shadow-xs" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  3. Сравнительная матрица всех сценариев 2026 г.
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Полный обзор применимости, ставок НДС, взносов и итоговой чистой прибыли
                </p>
              </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs font-medium rounded-xl bg-white/90 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              <div className="flex items-center p-1 rounded-2xl bg-slate-200/60 border border-slate-300/60 shadow-inner text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleQuickFilter('ALL')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    quickFilter === 'ALL'
                      ? 'tactile-pill-active'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFilter('IP')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    quickFilter === 'IP'
                      ? 'tactile-pill-active'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  ИП
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFilter('OOO')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    quickFilter === 'OOO'
                      ? 'tactile-pill-active'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  ООО
                </button>
              </div>
            </div>
          </div>

          {/* Scenarios Table */}
          <div className="w-full">
            <ScenariosTable
              scenarios={scenarios}
              selectedScenario={activeScenario}
              winner={winner}
              searchQuery={searchQuery}
              distributeProfitsToOwner={profile.distributeProfitsToOwner}
              onSelectScenario={(s) => {
                setSelectedScenarioId(s.id);
                scrollToSection('waterfall-section');
              }}
            />
          </div>
        </section>

        {/* =========================================================
            4. ДЕТАЛИЗАЦИЯ P&L И СТРЕСС-ТЕСТ УСТОЙЧИВОСТИ
            ========================================================= */}
        <section id="waterfall-section" className="relative z-10 space-y-3 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_2px_8px_rgba(168,85,247,0.35)]">
              <TrendingUp className="w-3.5 h-3.5 drop-shadow-xs" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                4. Детализация P&L и стресс-тест устойчивости
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Каскад формирования чистой прибыли и проверка модели при колебаниях оборота
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Detailed P&L Waterfall (7 cols) */}
            <div className="lg:col-span-7">
              <PnlWaterfall
                scenario={activeScenario}
                distributeProfitsToOwner={profile.distributeProfitsToOwner}
              />
            </div>

            {/* Right: Revenue Stress Test (5 cols) */}
            <div id="stress-section" className="lg:col-span-5">
              <MetalStressCard
                profile={profile}
                legislation={legislation}
                onApplyRevenue={(rev) => setProfile((p) => ({ ...p, revenueGross: rev }))}
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 pt-2 border-t border-slate-200">
          <Footer version={legislation.version} />
        </footer>
      </div>

      {/* Modal for 2026 Legislation parameters */}
      <LegislationModal
        isOpen={isLegislationModalOpen}
        legislation={legislation}
        onClose={() => setIsLegislationModalOpen(false)}
        onSave={(updated) => setLegislation(updated)}
        onReset={() => setLegislation(DEFAULT_LEGISLATION_2026)}
      />
    </div>
  );
}
