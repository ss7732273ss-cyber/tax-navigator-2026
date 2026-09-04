import { LegislationParams } from '../types';

export const DEFAULT_LEGISLATION_2026: LegislationParams = {
  version: '2026.1-OFFICIAL',
  year: 2026,
  
  // УСН
  usnMaxRevenue: 490_500_000,         // 490.5 млн ₽ — проиндексированный лимит 2026 г. (дефлятор 1.090)
  usnMaxEmployees: 130,               // до 130 сотрудников
  usnMaxFixedAssets: 218_000_000,     // 218 млн ₽ — лимит остаточной стоимости ОС в 2026 г.
  usnIncomeRate: 0.06,                // 6%
  usnExpenseRate: 0.15,               // 15%
  usnMinTaxRate: 0.01,                // 1% от выручки
  
  // Пределы 2025 года для права на УСН
  usn2025RetentionLimit: 450_000_000, // 450 млн ₽ — сохранение УСН за 2025 год
  usn2025Transition9MonthsOOO: 337_500_000, // 337.5 млн ₽ — переход ООО за 9 мес 2025
  
  // НДС
  vatExemptionThreshold: 20_000_000,  // 20 млн ₽ — порог освобождения (ст. 145 НК РФ)
  vatTier1Rate: 0.05,                 // 5% (без вычетов)
  vatTier1Threshold2025: 250_000_000, // 250 млн ₽ — порог по доходу за 2025 год для выбора ставки 5%
  vatTier1Threshold2026: 272_500_000, // 272.5 млн ₽ — порог 2026 года для смены 5% -> 7%
  vatTier2Rate: 0.07,                 // 7% (без вычетов)
  vatStandardRate: 0.22,              // 22% — базовая ставка с 1 января 2026 г. (с вычетами)
  
  // АУСН (ФЗ № 17-ФЗ)
  ausnMaxRevenue: 60_000_000,         // 60 млн ₽
  ausnMaxEmployees: 5,                // до 5 сотрудников
  ausnIncomeRate: 0.08,               // 8%
  ausnExpenseRate: 0.20,              // 20%
  ausnMinTaxRate: 0.03,               // 3% от выручки
  ausnInjuryContribution: 2_959,      // 2 959 ₽ в год (фикс. взнос на травматизм 2026 г.)
  
  // ОСНО
  corporateProfitTaxRate: 0.25,       // 25% — налог на прибыль ООО
  
  // Страховые взносы ИП за себя
  ipFixedContribution: 57_390,        // Фиксированная часть
  ip1PercentThreshold: 300_000,       // Порог для 1%
  ipMaxVariableContribution: 321_818, // Максимум 1%
  ipMaxTotalContribution: 379_208,    // Максимальные взносы ИП всего
  
  // Шкала НДФЛ ИП на ОСНО (5 ступеней, ст. 224 НК РФ)
  ndflBrackets: [
    { threshold: 2_400_000, rate: 0.13, baseTax: 0 },
    { threshold: 5_000_000, rate: 0.15, baseTax: 312_000 },
    { threshold: 20_000_000, rate: 0.18, baseTax: 702_000 },
    { threshold: 50_000_000, rate: 0.20, baseTax: 3_402_000 },
    { threshold: Infinity, rate: 0.22, baseTax: 9_402_000 },
  ],
  
  // НДФЛ с дивидендов резидентов (специальная 2-ступенчатая шкала)
  dividendBracketThreshold: 2_400_000,// 2.4 млн ₽
  dividendRateBelow: 0.13,            // 13%
  dividendRateAbove: 0.15,            // 15%
};
