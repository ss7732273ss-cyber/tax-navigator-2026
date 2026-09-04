/**
 * Основные типы данных для «Налогового навигатора» (версия 2026 г.)
 */

export type OrgFormSelection = 'IP' | 'OOO' | 'BOTH';

export type BusinessOriginStatus =
  | 'EXISTING_USN'          // Действующий плательщик УСН (сохранение режима)
  | 'TRANSITION_FROM_OTHER' // Переход на УСН с 2026 года (с ОСНО и др.)
  | 'NEW_BUSINESS_2026';    // Новый бизнес, созданный в 2026 году

export type PriorYearRevenueBand =
  | 'UP_TO_20M'         // до 20 млн ₽ (автоосвобождение по ст. 145 с 01.01.2026)
  | 'FROM_20M_TO_250M'  // от 20 до 250 млн ₽ (старт с НДС 5% или 22%)
  | 'FROM_250M_TO_450M' // от 250 до 450 млн ₽ (старт с НДС 7% или 22%)
  | 'OVER_450M';        // свыше 450 млн ₽ (для действующих — утрата права на УСН)

export type TaxRegimeType =
  | 'USN_INCOME'   // УСН «Доходы»
  | 'USN_EXPENSE'  // УСН «Доходы минус Расходы»
  | 'AUSN_INCOME'  // АУСН «Доходы»
  | 'AUSN_EXPENSE' // АУСН «Доходы минус Расходы»
  | 'OSNO';        // ОСНО (Общая система)

export type VatVariant =
  | 'EXEMPT_145'   // Освобождение от обязанностей плательщика НДС (ст. 145 НК РФ)
  | 'NOT_PAYER_17FZ' // Не является плательщиком НДС по закону об АУСН (ФЗ № 17-ФЗ)
  | 'SPECIAL_5'    // Специальная ставка НДС 5% (без вычетов)
  | 'SPECIAL_7'    // Специальная ставка НДС 7% (без вычетов)
  | 'MIXED_EXEMPT_TO_SPECIAL' // Смешанный год: часть года освобождение, затем 5%/7%
  | 'STANDARD_22'; // Общеустановленная ставка 22% (с полным вычетом входящего НДС)

export interface MonthlyRevenue {
  month: number; // 1..12
  revenue: number;
}

export interface BusinessProfile {
  // Организационная форма
  orgForm: OrgFormSelection;
  
  // Статус на 01.01.2026
  originStatus: BusinessOriginStatus;
  priorYearRevenueBand: PriorYearRevenueBand;
  ooo9MonthsLimitExceeded?: boolean; // Превышен ли лимит 337.5 млн за 9 мес 2025 (для ООО при переходе)
  
  // Выручка 2026 года
  revenueGross: number;
  useMonthlyDistribution: boolean;
  monthlyRevenues?: number[]; // 12 месяцев
  
  // Расходы
  variableExpensesGross: number;
  variableVatShare: number; // 0..1
  fixedExpensesGross: number;
  fixedVatShare: number;    // 0..1
  
  // Персонал
  employeeCount: number;
  employeePayrollTaxes: number; // Страховые взносы за работников
  
  // Дивиденды ООО
  distributeProfitsToOwner: boolean; // Учитывать ли НДФЛ на дивиденды (13%/15%)
}

export interface LegislationParams {
  version: string;
  year: number;
  
  // УСН
  usnMaxRevenue: number;         // 490 500 000 ₽ (дефлятор 1.090)
  usnMaxEmployees: number;       // 130 чел.
  usnMaxFixedAssets: number;     // 218 000 000 ₽
  usnIncomeRate: number;         // 0.06 (6%)
  usnExpenseRate: number;        // 0.15 (15%)
  usnMinTaxRate: number;         // 0.01 (1%)
  
  // Пределы 2025 года для права на УСН
  usn2025RetentionLimit: number; // 450 000 000 ₽
  usn2025Transition9MonthsOOO: number; // 337 500 000 ₽
  
  // НДС
  vatExemptionThreshold: number; // 20 000 000 ₽ (ст. 145)
  vatTier1Rate: number;          // 0.05 (5%)
  vatTier1Threshold2025: number; // 250 000 000 ₽ (порог по 2025 г.)
  vatTier1Threshold2026: number; // 272 500 000 ₽ (порог по 2026 г.)
  vatTier2Rate: number;          // 0.07 (7%)
  vatStandardRate: number;       // 0.22 (22%)
  
  // АУСН
  ausnMaxRevenue: number;        // 60 000 000 ₽
  ausnMaxEmployees: number;      // 5 чел.
  ausnIncomeRate: number;        // 0.08 (8%)
  ausnExpenseRate: number;       // 0.20 (20%)
  ausnMinTaxRate: number;        // 0.03 (3%)
  ausnInjuryContribution: number;// 2 959 ₽ в год
  
  // ОСНО
  corporateProfitTaxRate: number;// 0.25 (25%)
  
  // Взносы ИП за себя
  ipFixedContribution: number;      // 57 390 ₽
  ip1PercentThreshold: number;      // 300 000 ₽
  ipMaxVariableContribution: number;// 321 818 ₽
  ipMaxTotalContribution: number;   // 379 208 ₽
  
  // НДФЛ ИП на ОСНО (шкала 5 ступеней)
  ndflBrackets: Array<{
    threshold: number;
    rate: number;
    baseTax: number;
  }>;
  
  // НДФЛ с дивидендов резидентов (2 ступени)
  dividendBracketThreshold: number; // 2 400 000 ₽
  dividendRateBelow: number;        // 0.13 (13%)
  dividendRateAbove: number;        // 0.15 (15%)
}

export type ScenarioEligibilityStatus = 'ELIGIBLE' | 'WARNING' | 'INELIGIBLE';

export interface ScenarioResult {
  id: string;
  name: string;
  shortName: string;
  orgForm: 'IP' | 'OOO';
  regime: TaxRegimeType;
  vatVariant: VatVariant;
  vatDisplay: string;
  
  eligibility: {
    status: ScenarioEligibilityStatus;
    reasonTitle?: string;
    reasonDetails?: string;
    checklist?: Array<{ text: string; passed: boolean; note?: string }>;
  };
  
  // Финансовые показатели P&L
  revenueGross: number;          // Исходная выручка покупателя (с НДС)
  vatOutput: number;             // Исходящий НДС к начислению
  revenueNet: number;            // Чистая выручка без НДС
  
  variableExpensesNet: number;   // Переменные расходы (очищенные или брутто)
  fixedExpensesNet: number;      // Постоянные расходы
  vatInput: number;              // Входящий НДС к вычету (при 22%)
  vatPayable: number;            // НДС к уплате в бюджет (Исходящий - Входящий)
  
  grossProfit: number;           // Валовая прибыль
  operatingProfit: number;       // Операционная прибыль
  
  // Взносы и налоги режима
  ipSelfContributions: number;   // Взносы ИП за себя
  employeeTaxes: number;         // Страховые взносы за персонал
  calculatedRegimeTax: number;   // Исчисленный налог режима до вычета
  taxDeduction: number;          // Вычет по налогу (100% для ИП без персонала, 50% для остальных)
  isMinimumTaxApplied: boolean;  // Применен ли минимальный налог (УСН 1%, АУСН 3%)
  regimeTaxPayable: number;      // Итоговый налог режима к уплате
  
  // Итоговая нагрузка
  totalTaxBurden: number;        // Налог режима + НДС к уплате + взносы (ИП + штат)
  effectiveTaxRate: number;      // % от общей выручки
  
  // Прибыль
  netCompanyProfit: number;      // Чистая прибыль бизнеса
  dividendTax: number;           // НДФЛ с дивидендов (при выводе из ООО)
  netCashInHand: number;         // Деньги на руках у собственника
  
  // Пояснения к календарю
  calendarNote?: string;
}
