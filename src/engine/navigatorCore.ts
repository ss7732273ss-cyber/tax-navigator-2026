import {
  BusinessProfile,
  LegislationParams,
  ScenarioResult,
  TaxRegimeType,
  VatVariant,
} from '../types';
import { calculateIpContributions, calculateUsnIncomeDeduction } from './contributions';
import { checkRegimeEligibility } from './eligibility';
import { calculateDividendNdfl, calculatePersonalNdflScale } from './ndfl';
import { calculateVatAndRevenues } from './vatCalculator';

interface ScenarioDefinition {
  id: string;
  name: string;
  shortName: string;
  orgForm: 'IP' | 'OOO';
  regime: TaxRegimeType;
  vatVariant: VatVariant;
  vatDisplay: string;
}

export function generateAndCalculateAllScenarios(
  profile: BusinessProfile,
  params: LegislationParams
): {
  scenarios: ScenarioResult[];
  winner: ScenarioResult | null;
  bestIp: ScenarioResult | null;
  bestOoo: ScenarioResult | null;
} {
  const definitions: ScenarioDefinition[] = [];

  const forms: Array<'IP' | 'OOO'> =
    profile.orgForm === 'BOTH' ? ['IP', 'OOO'] : [profile.orgForm];

  for (const form of forms) {
    const prefix = form === 'IP' ? 'ИП' : 'ООО';

    // 1. УСН «Доходы»
    definitions.push(
      {
        id: `${form}_USN_INC_EXEMPT`,
        name: `${prefix} — УСН «Доходы» (Освобождение по ст. 145 НК РФ)`,
        shortName: 'УСН 6% (Освобождение ст.145)',
        orgForm: form,
        regime: 'USN_INCOME',
        vatVariant: 'EXEMPT_145',
        vatDisplay: 'Освобождение (ст. 145)',
      },
      {
        id: `${form}_USN_INC_VAT5`,
        name: `${prefix} — УСН «Доходы» (НДС 5% без вычетов)`,
        shortName: 'УСН 6% (НДС 5%)',
        orgForm: form,
        regime: 'USN_INCOME',
        vatVariant: 'SPECIAL_5',
        vatDisplay: 'НДС 5% (без вычетов)',
      },
      {
        id: `${form}_USN_INC_VAT7`,
        name: `${prefix} — УСН «Доходы» (НДС 7% без вычетов)`,
        shortName: 'УСН 6% (НДС 7%)',
        orgForm: form,
        regime: 'USN_INCOME',
        vatVariant: 'SPECIAL_7',
        vatDisplay: 'НДС 7% (без вычетов)',
      },
      {
        id: `${form}_USN_INC_VAT22`,
        name: `${prefix} — УСН «Доходы» (НДС 22% с полным вычетом)`,
        shortName: 'УСН 6% (НДС 22%)',
        orgForm: form,
        regime: 'USN_INCOME',
        vatVariant: 'STANDARD_22',
        vatDisplay: 'НДС 22% (с вычетами)',
      }
    );

    // 2. УСН «Доходы минус Расходы»
    definitions.push(
      {
        id: `${form}_USN_EXP_EXEMPT`,
        name: `${prefix} — УСН «Д−Р» (Освобождение по ст. 145 НК РФ)`,
        shortName: 'УСН 15% (Освобождение ст.145)',
        orgForm: form,
        regime: 'USN_EXPENSE',
        vatVariant: 'EXEMPT_145',
        vatDisplay: 'Освобождение (ст. 145)',
      },
      {
        id: `${form}_USN_EXP_VAT5`,
        name: `${prefix} — УСН «Д−Р» (НДС 5% без вычетов)`,
        shortName: 'УСН 15% (НДС 5%)',
        orgForm: form,
        regime: 'USN_EXPENSE',
        vatVariant: 'SPECIAL_5',
        vatDisplay: 'НДС 5% (без вычетов)',
      },
      {
        id: `${form}_USN_EXP_VAT7`,
        name: `${prefix} — УСН «Д−Р» (НДС 7% без вычетов)`,
        shortName: 'УСН 15% (НДС 7%)',
        orgForm: form,
        regime: 'USN_EXPENSE',
        vatVariant: 'SPECIAL_7',
        vatDisplay: 'НДС 7% (без вычетов)',
      },
      {
        id: `${form}_USN_EXP_VAT22`,
        name: `${prefix} — УСН «Д−Р» (НДС 22% с полным вычетом)`,
        shortName: 'УСН 15% (НДС 22%)',
        orgForm: form,
        regime: 'USN_EXPENSE',
        vatVariant: 'STANDARD_22',
        vatDisplay: 'НДС 22% (с вычетами)',
      }
    );

    // 3. АУСН (Автоматизированная УСН)
    definitions.push(
      {
        id: `${form}_AUSN_INC`,
        name: `${prefix} — АУСН «Доходы» 8% (ФЗ № 17-ФЗ)`,
        shortName: 'АУСН 8% (Доходы)',
        orgForm: form,
        regime: 'AUSN_INCOME',
        vatVariant: 'NOT_PAYER_17FZ',
        vatDisplay: 'Не плательщик НДС',
      },
      {
        id: `${form}_AUSN_EXP`,
        name: `${prefix} — АУСН «Д−Р» 20% (ФЗ № 17-ФЗ)`,
        shortName: 'АУСН 20% (Д−Р)',
        orgForm: form,
        regime: 'AUSN_EXPENSE',
        vatVariant: 'NOT_PAYER_17FZ',
        vatDisplay: 'Не плательщик НДС',
      }
    );

    // 4. ОСНО (Общая система)
    definitions.push({
      id: `${form}_OSNO`,
      name: `${prefix} — ОСНО (НДС 22% + ${form === 'IP' ? 'НДФЛ 13-22%' : 'Налог на прибыль 25%'})`,
      shortName: form === 'IP' ? 'ОСНО (ИП: НДФЛ 13-22%)' : 'ОСНО (ООО: Прибыль 25%)',
      orgForm: form,
      regime: 'OSNO',
      vatVariant: 'STANDARD_22',
      vatDisplay: 'НДС 22% (с вычетами)',
    });
  }

  const results: ScenarioResult[] = definitions.map((def) =>
    calculateSingleScenario(def, profile, params)
  );

  // Определение лидеров среди допустимых сценариев (ELIGIBLE или WARNING)
  const validScenarios = results.filter((s) => s.eligibility.status !== 'INELIGIBLE');

  // Сортировка по итоговым деньгам на руках (или чистой прибыли компании)
  const metricKey = profile.distributeProfitsToOwner ? 'netCashInHand' : 'netCompanyProfit';
  validScenarios.sort((a, b) => b[metricKey] - a[metricKey]);

  const winner = validScenarios.length > 0 ? validScenarios[0] : null;

  const validIp = validScenarios.filter((s) => s.orgForm === 'IP');
  const validOoo = validScenarios.filter((s) => s.orgForm === 'OOO');

  const bestIp = validIp.length > 0 ? validIp[0] : null;
  const bestOoo = validOoo.length > 0 ? validOoo[0] : null;

  return {
    scenarios: results,
    winner,
    bestIp,
    bestOoo,
  };
}

function calculateSingleScenario(
  def: ScenarioDefinition,
  profile: BusinessProfile,
  params: LegislationParams
): ScenarioResult {
  const { orgForm, regime, vatVariant } = def;
  const { employeeCount, employeePayrollTaxes, distributeProfitsToOwner } = profile;

  // 1. Проверка применимости (Eligibility Engine)
  const eligibility = checkRegimeEligibility(orgForm, regime, vatVariant, profile, params);

  // 2. Расчет выручки и НДС
  const vatResult = calculateVatAndRevenues(vatVariant, profile, params);
  const {
    revenueGross,
    vatOutput,
    revenueNet,
    variableExpensesNet,
    fixedExpensesNet,
    vatInput,
    vatPayable,
    calendarNote,
  } = vatResult;

  // 3. Расчет прибыли до налогов и взносов
  const grossProfit = revenueNet - variableExpensesNet;
  const operatingProfit = grossProfit - fixedExpensesNet;

  // 4. Страховые взносы
  let ipSelfContributions = 0;
  let employeeTaxes = 0;

  if (regime === 'AUSN_INCOME' || regime === 'AUSN_EXPENSE') {
    // При АУСН взносы за персонал 0%, взносы ИП за себя 0%, только фикс травматизм 2 959 ₽
    employeeTaxes = params.ausnInjuryContribution;
    ipSelfContributions = 0;
  } else {
    employeeTaxes = employeePayrollTaxes;
    if (orgForm === 'IP') {
      const ipBreakdown = calculateIpContributions(revenueNet, params);
      ipSelfContributions = ipBreakdown.totalIpContributions;
    }
  }

  // 5. Расчет налога режима
  let calculatedRegimeTax = 0;
  let taxDeduction = 0;
  let isMinimumTaxApplied = false;
  let regimeTaxPayable = 0;

  if (regime === 'USN_INCOME') {
    // Налоговая база — чистая выручка без НДС
    const base = Math.max(0, revenueNet);
    calculatedRegimeTax = base * params.usnIncomeRate;

    // Вычет взносов (100% для ИП без персонала, 50% для остальных)
    const deductionResult = calculateUsnIncomeDeduction(
      orgForm,
      calculatedRegimeTax,
      ipSelfContributions,
      employeeTaxes,
      employeeCount
    );
    taxDeduction = deductionResult.deduction;
    regimeTaxPayable = Math.max(0, calculatedRegimeTax - taxDeduction);
  } else if (regime === 'USN_EXPENSE') {
    // На УСН «Д−Р» взносы ИП за себя и за персонал включаются в расходы
    const deductibleExpenses =
      variableExpensesNet + fixedExpensesNet + ipSelfContributions + employeeTaxes;
    const base = Math.max(0, revenueNet - deductibleExpenses);
    const regularTax = base * params.usnExpenseRate;
    const minTax = revenueNet * params.usnMinTaxRate;

    if (regularTax >= minTax) {
      calculatedRegimeTax = regularTax;
      regimeTaxPayable = regularTax;
      isMinimumTaxApplied = false;
    } else {
      calculatedRegimeTax = regularTax;
      regimeTaxPayable = minTax;
      isMinimumTaxApplied = true;
    }
  } else if (regime === 'AUSN_INCOME') {
    // АУСН «Доходы» 8% без вычетов
    const base = Math.max(0, revenueNet);
    calculatedRegimeTax = base * params.ausnIncomeRate;
    regimeTaxPayable = calculatedRegimeTax;
  } else if (regime === 'AUSN_EXPENSE') {
    // АУСН «Д−Р» 20%, минимальный налог 3%
    const deductibleExpenses = variableExpensesNet + fixedExpensesNet + employeeTaxes;
    const base = Math.max(0, revenueNet - deductibleExpenses);
    const regularTax = base * params.ausnExpenseRate;
    const minTax = revenueNet * params.ausnMinTaxRate;

    if (regularTax >= minTax) {
      calculatedRegimeTax = regularTax;
      regimeTaxPayable = regularTax;
      isMinimumTaxApplied = false;
    } else {
      calculatedRegimeTax = regularTax;
      regimeTaxPayable = minTax;
      isMinimumTaxApplied = true;
    }
  } else if (regime === 'OSNO') {
    // На ОСНО база = Выручка очищ. - Расходы очищ. - Взносы
    const deductibleExpenses =
      variableExpensesNet + fixedExpensesNet + ipSelfContributions + employeeTaxes;
    const base = Math.max(0, revenueNet - deductibleExpenses);

    if (orgForm === 'OOO') {
      // Налог на прибыль 25%
      calculatedRegimeTax = base * params.corporateProfitTaxRate;
      regimeTaxPayable = calculatedRegimeTax;
    } else {
      // НДФЛ ИП по прогрессивной шкале 13–22%
      calculatedRegimeTax = calculatePersonalNdflScale(base, params);
      regimeTaxPayable = calculatedRegimeTax;
    }
  }

  // 6. Итоговая чистая прибыль бизнеса
  // Чистая прибыль = Операционная прибыль - Налог режима - Взносы ИП - Взносы за персонал - НДС к уплате
  // (Входящий НДС при 22% уже был вычтен в vatPayable, а расходы очищены)
  let netCompanyProfit = 0;
  if (vatVariant === 'STANDARD_22') {
    netCompanyProfit = operatingProfit - regimeTaxPayable - ipSelfContributions - employeeTaxes;
  } else {
    // При ставках 0%/5%/7% операционная прибыль уже включает расходы брутто
    netCompanyProfit = operatingProfit - regimeTaxPayable - ipSelfContributions - employeeTaxes;
  }

  // 7. Расчет вывода дивидендов собственнику (НДФЛ 13%/15%)
  let dividendTax = 0;
  let netCashInHand = netCompanyProfit;

  if (orgForm === 'OOO') {
    if (distributeProfitsToOwner && netCompanyProfit > 0) {
      const divResult = calculateDividendNdfl(netCompanyProfit, params);
      dividendTax = divResult.dividendTax;
      netCashInHand = divResult.netCashInHand;
    } else {
      dividendTax = 0;
      netCashInHand = netCompanyProfit;
    }
  } else {
    // Для ИП деньги на счете — личные деньги предпринимателя (дивидендного налога нет!)
    dividendTax = 0;
    netCashInHand = netCompanyProfit;
  }

  // Совокупная налоговая нагрузка: Налог режима + НДС к уплате + Взносы ИП + Взносы персонал + Налог на дивиденды
  const totalTaxBurden =
    regimeTaxPayable + vatPayable + ipSelfContributions + employeeTaxes + dividendTax;
  const effectiveTaxRate = revenueGross > 0 ? (totalTaxBurden / revenueGross) * 100 : 0;

  return {
    ...def,
    eligibility,
    revenueGross,
    vatOutput,
    revenueNet,
    variableExpensesNet,
    fixedExpensesNet,
    vatInput,
    vatPayable,
    grossProfit,
    operatingProfit,
    ipSelfContributions,
    employeeTaxes,
    calculatedRegimeTax,
    taxDeduction,
    isMinimumTaxApplied,
    regimeTaxPayable,
    totalTaxBurden,
    effectiveTaxRate,
    netCompanyProfit,
    dividendTax,
    netCashInHand,
    calendarNote,
  };
}
