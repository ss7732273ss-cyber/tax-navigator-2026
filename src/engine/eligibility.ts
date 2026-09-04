import { BusinessProfile, LegislationParams, ScenarioEligibilityStatus, TaxRegimeType, VatVariant } from '../types';

export interface EligibilityVerdict {
  status: ScenarioEligibilityStatus;
  reasonTitle?: string;
  reasonDetails?: string;
  checklist?: Array<{ text: string; passed: boolean; note?: string }>;
}

export function checkRegimeEligibility(
  orgForm: 'IP' | 'OOO',
  regime: TaxRegimeType,
  vatVariant: VatVariant,
  profile: BusinessProfile,
  params: LegislationParams
): EligibilityVerdict {
  const { revenueGross, employeeCount, originStatus, priorYearRevenueBand, ooo9MonthsLimitExceeded } = profile;

  // 1. ПРОВЕРКА АУСН (ФЗ № 17-ФЗ)
  if (regime === 'AUSN_INCOME' || regime === 'AUSN_EXPENSE') {
    // В НДС вариантах для АУСН допустим только NOT_PAYER_17FZ
    if (vatVariant !== 'NOT_PAYER_17FZ') {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'НДС не применяется на АУСН',
        reasonDetails: 'Плательщики АУСН не признаются плательщиками НДС (ч. 6 ст. 2 ФЗ № 17-ФЗ). Специальные ставки 5%/7% и 22% запрещены.',
      };
    }

    if (revenueGross > params.ausnMaxRevenue) {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'Превышен лимит дохода АУСН',
        reasonDetails: `Выручка (${formatMoney(revenueGross)}) превышает законодательный предел 60 млн ₽ (п. 2 ч. 2 ст. 3 ФЗ № 17-ФЗ).`,
      };
    }

    if (employeeCount > params.ausnMaxEmployees) {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'Превышен лимит численности АУСН',
        reasonDetails: `Количество сотрудников (${employeeCount} чел.) превышает максимум в 5 человек (п. 1 ч. 2 ст. 3 ФЗ № 17-ФЗ).`,
      };
    }

    // Проверка по доходу предшествующего года для действующих
    if (originStatus === 'EXISTING_USN' && (priorYearRevenueBand === 'FROM_250M_TO_450M' || priorYearRevenueBand === 'OVER_450M')) {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'Доход 2025 года выше лимита АУСН',
        reasonDetails: 'Доход за 2025 год превышал 60 млн ₽. Переход на АУСН с 2026 года невозможен.',
      };
    }

    // Режим применим по проверяемым числовым критериям, но требует соблюдения чек-листа
    return {
      status: 'WARNING',
      reasonTitle: 'Применим по базовым критериям (требует проверки чек-листа)',
      reasonDetails: 'Выручка до 60 млн ₽ и штат до 5 чел. соблюдены. Проверьте обязательные регуляторные требования эксперимента ФНС.',
      checklist: [
        { text: 'Численность сотрудников не более 5 человек', passed: employeeCount <= 5, note: `${employeeCount} чел.` },
        { text: 'Годовой доход не более 60 млн ₽', passed: revenueGross <= 60_000_000, note: formatMoney(revenueGross) },
        { text: 'Счета открыты только в уполномоченных банках (реестр ФНС)', passed: true, note: 'Требуется соответствие' },
        { text: 'Зарплата выплачивается только безналично через банк', passed: true, note: 'Требуется соответствие' },
        { text: 'Отсутствуют филиалы и обособленные подразделения (для ООО)', passed: true, note: 'Для ООО' },
        { text: 'Доля участия других юрлиц не более 25% (для ООО)', passed: true, note: 'Для ООО' },
      ],
    };
  }

  // 2. ПРОВЕРКА УСН (ст. 346.12 и ст. 346.13 НК РФ)
  if (regime === 'USN_INCOME' || regime === 'USN_EXPENSE') {
    // Проверка численности
    if (employeeCount > params.usnMaxEmployees) {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'Превышен лимит сотрудников УСН',
        reasonDetails: `Штат (${employeeCount} чел.) превышает установленный лимит в 130 человек (пп. 15 п. 3 ст. 346.12 НК РФ).`,
      };
    }

    // Проверка права на УСН на 01.01.2026 по данным 2025 года
    if (originStatus === 'EXISTING_USN') {
      if (priorYearRevenueBand === 'OVER_450M') {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Утрата права на УСН по итогам 2025 года',
          reasonDetails: 'Доход за 2025 год превысил 450 млн ₽. Применение УСН с 01.01.2026 не разрешено законом (только ОСНО).',
        };
      }
    } else if (originStatus === 'TRANSITION_FROM_OTHER') {
      if (orgForm === 'OOO' && ooo9MonthsLimitExceeded) {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Запрет перехода организации на УСН',
          reasonDetails: 'Доход ООО за 9 месяцев 2025 года превысил 337,5 млн ₽ (п. 2 ст. 346.12 НК РФ). Переход на 2026 год заблокирован.',
        };
      }
      if (priorYearRevenueBand === 'OVER_450M') {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Превышен лимит перехода на УСН',
          reasonDetails: 'Доход за 2025 год превышает 450 млн ₽. Переход на УСН невозможен.',
        };
      }
    }

    // Проверка выручки 2026 года: если > 490.5 млн ₽
    if (revenueGross > params.usnMaxRevenue) {
      return {
        status: 'WARNING',
        reasonTitle: 'Превышение лимита УСН в течение 2026 года',
        reasonDetails: `Выручка 2026 года (${formatMoney(revenueGross)}) превышает проиндексированный лимит 490,5 млн ₽. Право на УСН утрачивается с 1-го числа месяца превышения с переходом на ОСНО.`,
      };
    }

    // ПРОВЕРКА ВАРИАНТОВ НДС НА УСН
    if (vatVariant === 'EXEMPT_145') {
      // Освобождение по ст. 145
      if (originStatus === 'EXISTING_USN' && priorYearRevenueBand !== 'UP_TO_20M') {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Освобождение по ст. 145 недоступно с 01.01.2026',
          reasonDetails: 'Доход за 2025 год превысил 20 млн ₽. С 1 января 2026 года плательщик обязан исчислять НДС (5%, 7% или 22%).',
        };
      }
      // Если доход 2026 года > 20 млн, но в 2025 было <= 20 млн: действует смешанный год!
      if (revenueGross > params.vatExemptionThreshold) {
        return {
          status: 'ELIGIBLE',
          reasonTitle: 'Смешанный год: ст. 145 + уплата НДС',
          reasonDetails: 'С 1 января действует освобождение; со следующего месяца после превышения 20 млн ₽ возникает обязанность уплаты НДС.',
        };
      }
      return {
        status: 'ELIGIBLE',
        reasonTitle: 'Обязательное освобождение по ст. 145 НК РФ',
        reasonDetails: 'Доход до 20 млн ₽. Освобождение от обязанностей плательщика НДС действует в силу закона.',
      };
    }

    if (vatVariant === 'SPECIAL_5') {
      // Ставка 5% применима в диапазоне до 272.5 млн ₽
      if (originStatus === 'EXISTING_USN' && (priorYearRevenueBand === 'FROM_250M_TO_450M' || priorYearRevenueBand === 'OVER_450M')) {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Ставка 5% недоступна с 01.01.2026',
          reasonDetails: 'Доход за 2025 год превысил 250 млн ₽. Налогоплательщик обязан сразу применять ставку 7% (или 22%).',
        };
      }
      if (revenueGross <= params.vatExemptionThreshold && (originStatus === 'NEW_BUSINESS_2026' || priorYearRevenueBand === 'UP_TO_20M')) {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Ставка 5% не применяется при праве на освобождение',
          reasonDetails: 'При доходе до 20 млн ₽ освобождение по ст. 145 НК РФ носит обязательный характер; добровольная уплата 5% законом не предусмотрена.',
        };
      }
      if (revenueGross > params.vatTier1Threshold2026) {
        return {
          status: 'WARNING',
          reasonTitle: 'Переход со ставки 5% на 7% в течение года',
          reasonDetails: `Выручка 2026 г. превышает 272,5 млн ₽. Со следующего месяца после превышения применяется ставка 7%.`,
        };
      }
      return {
        status: 'ELIGIBLE',
      };
    }

    if (vatVariant === 'SPECIAL_7') {
      // Ставка 7% применяется при доходе свыше 272.5 млн (или если в 2025 г. было > 250 млн)
      const hadPriorHighRevenue = priorYearRevenueBand === 'FROM_250M_TO_450M';
      if (revenueGross <= params.vatTier1Threshold2026 && !hadPriorHighRevenue) {
        return {
          status: 'INELIGIBLE',
          reasonTitle: 'Ставка 7% неприменима (доход ниже порога)',
          reasonDetails: `Выручка (${formatMoney(revenueGross)}) не превышает 272,5 млн ₽. Применяется ставка 5% или освобождение.`,
        };
      }
      return {
        status: 'ELIGIBLE',
      };
    }

    if (vatVariant === 'STANDARD_22') {
      // Стандартная ставка 22% с вычетами доступна налогоплательщику УСН по выбору
      if (revenueGross <= params.vatExemptionThreshold && (originStatus === 'NEW_BUSINESS_2026' || priorYearRevenueBand === 'UP_TO_20M')) {
        return {
          status: 'WARNING',
          reasonTitle: 'Отказ от освобождения в пользу ставки 22%',
          reasonDetails: 'Закон позволяет отказаться от освобождения по ст. 145 в пользу общей ставки с вычетами, если это выгодно из-за контрактов с НДС.',
        };
      }
      return {
        status: 'ELIGIBLE',
      };
    }
  }

  // 3. ПРОВЕРКА ОСНО
  if (regime === 'OSNO') {
    if (vatVariant !== 'STANDARD_22') {
      return {
        status: 'INELIGIBLE',
        reasonTitle: 'На ОСНО действует стандартный НДС 22%',
        reasonDetails: 'Специальные ставки УСН 5% и 7% на ОСНО не применяются. Действует ставка 22% с полным правом на вычет входящего НДС.',
      };
    }
    return {
      status: 'ELIGIBLE',
      reasonTitle: 'Общая система налогообложения (без ограничений по доходу и штату)',
    };
  }

  return { status: 'ELIGIBLE' };
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace('.0', '') + ' млн ₽';
  }
  return n.toLocaleString('ru-RU') + ' ₽';
}
