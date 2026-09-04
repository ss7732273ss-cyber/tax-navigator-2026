import { BusinessProfile, LegislationParams, VatVariant } from '../types';

export interface VatCalculationResult {
  revenueGross: number;
  vatOutput: number;
  revenueNet: number;
  
  variableExpensesNet: number;
  fixedExpensesNet: number;
  vatInput: number;       // Входящий НДС, принимаемый к вычету (только при 22%)
  vatPayable: number;     // НДС к уплате в бюджет
  
  calendarNote?: string;
  isMixedYear: boolean;
}

export function calculateVatAndRevenues(
  vatVariant: VatVariant,
  profile: BusinessProfile,
  params: LegislationParams
): VatCalculationResult {
  const {
    revenueGross,
    variableExpensesGross,
    variableVatShare,
    fixedExpensesGross,
    fixedVatShare,
    useMonthlyDistribution,
    monthlyRevenues,
    priorYearRevenueBand,
    originStatus,
  } = profile;

  // Построение помесячного массива выручки (12 месяцев)
  const monthly: number[] = new Array(12).fill(0);
  if (useMonthlyDistribution && monthlyRevenues && monthlyRevenues.length === 12) {
    const totalInput = monthlyRevenues.reduce((a, b) => a + b, 0);
    if (totalInput > 0) {
      for (let i = 0; i < 12; i++) {
        monthly[i] = monthlyRevenues[i];
      }
    } else {
      const avg = revenueGross / 12;
      for (let i = 0; i < 12; i++) monthly[i] = avg;
    }
  } else {
    const avg = revenueGross / 12;
    for (let i = 0; i < 12; i++) monthly[i] = avg;
  }

  // 1. АУСН (Не является плательщиком НДС по ФЗ № 17-ФЗ)
  if (vatVariant === 'NOT_PAYER_17FZ') {
    return {
      revenueGross,
      vatOutput: 0,
      revenueNet: revenueGross,
      variableExpensesNet: variableExpensesGross,
      fixedExpensesNet: fixedExpensesGross,
      vatInput: 0,
      vatPayable: 0,
      isMixedYear: false,
      calendarNote: 'Не признается плательщиком НДС (ч. 6 ст. 2 ФЗ № 17-ФЗ). Входящий НДС учитывается в стоимости товаров/услуг.',
    };
  }

  // 2. СТАНДАРТНАЯ СТАВКА 22% (ОСНО или УСН 22% с вычетами)
  if (vatVariant === 'STANDARD_22') {
    const revenueNet = revenueGross / (1 + params.vatStandardRate);
    const vatOutput = revenueGross - revenueNet;

    // Входящий НДС по расходам
    const varVatGross = variableExpensesGross * variableVatShare;
    const varVatNet = varVatGross / (1 + params.vatStandardRate);
    const varVatInput = varVatGross - varVatNet;
    const variableExpensesNet = (variableExpensesGross * (1 - variableVatShare)) + varVatNet;

    const fixVatGross = fixedExpensesGross * fixedVatShare;
    const fixVatNet = fixVatGross / (1 + params.vatStandardRate);
    const fixVatInput = fixVatGross - fixVatNet;
    const fixedExpensesNet = (fixedExpensesGross * (1 - fixedVatShare)) + fixVatNet;

    const vatInput = varVatInput + fixVatInput;
    const vatPayable = Math.max(0, vatOutput - vatInput);

    return {
      revenueGross,
      vatOutput,
      revenueNet,
      variableExpensesNet,
      fixedExpensesNet,
      vatInput,
      vatPayable,
      isMixedYear: false,
      calendarNote: `Стандартный НДС 22%: выручка очищена на ${(vatOutput / 1_000_000).toFixed(1)} млн ₽, принят вычет входного НДС ${(vatInput / 1_000_000).toFixed(1)} млн ₽.`,
    };
  }

  // 3. ОСВОБОЖДЕНИЕ ПО СТ. 145 НК РФ (ИЛИ СМЕШАННЫЙ ГОД)
  if (vatVariant === 'EXEMPT_145' || vatVariant === 'MIXED_EXEMPT_TO_SPECIAL') {
    const isExemptAtStart =
      originStatus === 'NEW_BUSINESS_2026' || priorYearRevenueBand === 'UP_TO_20M';

    // Случай А: Доход 2026 года не превышает 20 млн ₽ -> полное освобождение 12 месяцев
    if (revenueGross <= params.vatExemptionThreshold || !isExemptAtStart) {
      if (!isExemptAtStart) {
        // Если освобождения не было на 01.01.2026, то применяется ставка 5%
        return calculateSpecial5(profile, params, monthly);
      }
      return {
        revenueGross,
        vatOutput: 0,
        revenueNet: revenueGross,
        variableExpensesNet: variableExpensesGross,
        fixedExpensesNet: fixedExpensesGross,
        vatInput: 0,
        vatPayable: 0,
        isMixedYear: false,
        calendarNote: 'Освобождение от исполнения обязанностей плательщика НДС (ст. 145 НК РФ) действует весь календарный год.',
      };
    }

    // Случай Б: Смешанный год!
    // Находим месяц m_exceed, в котором нарастающий итог выручки превысил 20 млн ₽
    let cumulative = 0;
    let monthExceeded = 12;
    for (let m = 0; m < 12; m++) {
      cumulative += monthly[m];
      if (cumulative > params.vatExemptionThreshold) {
        monthExceeded = m + 1; // 1-indexed (1..12)
        break;
      }
    }

    // Право на освобождение утрачивается с 1-го числа месяца, СЛЕДУЮЩЕГО за месяцем превышения (п. 5 ст. 145 НК РФ)
    // Т.е. месяцы 1..monthExceeded — освобождение от НДС
    // Месяцы (monthExceeded + 1)..12 — уплата НДС по ставке 5% (или 7% если превышен 272.5 млн)
    let exemptRevenue = 0;
    let vatRevenue = 0;
    for (let m = 0; m < 12; m++) {
      if (m + 1 <= monthExceeded) {
        exemptRevenue += monthly[m];
      } else {
        vatRevenue += monthly[m];
      }
    }

    // Доля периода после освобождения
    const vatPeriodShare = vatRevenue / revenueGross;

    // Расчет НДС в период после освобождения (ставка 5%)
    const vatNetInPeriod = vatRevenue / (1 + params.vatTier1Rate);
    const vatOutputInPeriod = vatRevenue - vatNetInPeriod;

    const revenueNet = exemptRevenue + vatNetInPeriod;
    const vatOutput = vatOutputInPeriod;
    const vatPayable = vatOutput; // При ставке 5% вычетов нет

    // Входящий НДС не вычитается (остается в составе расходов)
    const variableExpensesNet = variableExpensesGross;
    const fixedExpensesNet = fixedExpensesGross;

    const monthNames = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
    const exceedMonthName = monthNames[Math.min(monthExceeded - 1, 11)];
    const startVatMonthName = monthNames[Math.min(monthExceeded, 11)];

    return {
      revenueGross,
      vatOutput,
      revenueNet,
      variableExpensesNet,
      fixedExpensesNet,
      vatInput: 0,
      vatPayable,
      isMixedYear: true,
      calendarNote: `Смешанный год: порог 20 млн ₽ превышен в ${exceedMonthName} (накоплено ${(cumulative / 1_000_000).toFixed(1)} млн ₽). Освобождение действовало до конца месяца; с 1-го числа следующего месяца (${startVatMonthName}) начислено 5% НДС (${(vatOutput / 1_000_000).toFixed(2)} млн ₽).`,
    };
  }

  // 4. СПЕЦИАЛЬНАЯ СТАВКА 5% (ИЛИ ПЕРЕХОД 5% -> 7%)
  if (vatVariant === 'SPECIAL_5') {
    return calculateSpecial5(profile, params, monthly);
  }

  // 5. СПЕЦИАЛЬНАЯ СТАВКА 7%
  if (vatVariant === 'SPECIAL_7') {
    const revenueNet = revenueGross / (1 + params.vatTier2Rate);
    const vatOutput = revenueGross - revenueNet;
    return {
      revenueGross,
      vatOutput,
      revenueNet,
      variableExpensesNet: variableExpensesGross,
      fixedExpensesNet: fixedExpensesGross,
      vatInput: 0,
      vatPayable: vatOutput,
      isMixedYear: false,
      calendarNote: `Специальная ставка НДС 7% без права вычетов: НДС ${(vatOutput / 1_000_000).toFixed(2)} млн ₽.`,
    };
  }

  return {
    revenueGross,
    vatOutput: 0,
    revenueNet: revenueGross,
    variableExpensesNet: variableExpensesGross,
    fixedExpensesNet: fixedExpensesGross,
    vatInput: 0,
    vatPayable: 0,
    isMixedYear: false,
  };
}

function calculateSpecial5(
  profile: BusinessProfile,
  params: LegislationParams,
  monthly: number[]
): VatCalculationResult {
  const { revenueGross, variableExpensesGross, fixedExpensesGross } = profile;

  // Если выручка не превышает 272.5 млн ₽ — весь год действует ставка 5%
  if (revenueGross <= params.vatTier1Threshold2026) {
    const revenueNet = revenueGross / (1 + params.vatTier1Rate);
    const vatOutput = revenueGross - revenueNet;
    return {
      revenueGross,
      vatOutput,
      revenueNet,
      variableExpensesNet: variableExpensesGross,
      fixedExpensesNet: fixedExpensesGross,
      vatInput: 0,
      vatPayable: vatOutput,
      isMixedYear: false,
      calendarNote: `Специальная ставка НДС 5% без вычетов: начислено ${(vatOutput / 1_000_000).toFixed(2)} млн ₽.`,
    };
  }

  // Выручка > 272.5 млн ₽! Переход 5% -> 7%
  // По закону (п. 9 ст. 164 НК РФ): ставка 7% применяется с 1-го числа месяца, СЛЕДУЮЩЕГО за месяцем превышения!
  let cumulative = 0;
  let monthExceeded = 12;
  for (let m = 0; m < 12; m++) {
    cumulative += monthly[m];
    if (cumulative > params.vatTier1Threshold2026) {
      monthExceeded = m + 1; // 1..12
      break;
    }
  }

  let rev5 = 0;
  let rev7 = 0;
  for (let m = 0; m < 12; m++) {
    if (m + 1 <= monthExceeded) {
      rev5 += monthly[m];
    } else {
      rev7 += monthly[m];
    }
  }

  const net5 = rev5 / (1 + params.vatTier1Rate);
  const vat5 = rev5 - net5;

  const net7 = rev7 / (1 + params.vatTier2Rate);
  const vat7 = rev7 - net7;

  const revenueNet = net5 + net7;
  const vatOutput = vat5 + vat7;

  const monthNames = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
  const exceedMonthName = monthNames[Math.min(monthExceeded - 1, 11)];
  const nextMonthName = monthNames[Math.min(monthExceeded, 11)];

  return {
    revenueGross,
    vatOutput,
    revenueNet,
    variableExpensesNet: variableExpensesGross,
    fixedExpensesNet: fixedExpensesGross,
    vatInput: 0,
    vatPayable: vatOutput,
    isMixedYear: true,
    calendarNote: `Порог 272,5 млн ₽ превышен в ${exceedMonthName}. До конца месяца действовала ставка 5% (выручка ${(rev5 / 1_000_000).toFixed(1)} млн ₽); со следующего месяца (${nextMonthName}) применяется ставка 7% (выручка ${(rev7 / 1_000_000).toFixed(1)} млн ₽).`,
  };
}
