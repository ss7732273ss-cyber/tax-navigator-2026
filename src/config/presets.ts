import { BusinessProfile } from '../types';

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  badge: string;
  profile: BusinessProfile;
}

export const BUSINESS_PRESETS: PresetProfile[] = [
  {
    id: 'it_services',
    name: 'IT и разработка ПО',
    description: 'Высокая маржинальность, малая доля входящего НДС, небольшая команда.',
    badge: 'Услуги',
    profile: {
      orgForm: 'BOTH',
      originStatus: 'EXISTING_USN',
      priorYearRevenueBand: 'UP_TO_20M',
      revenueGross: 18_000_000,
      useMonthlyDistribution: false,
      variableExpensesGross: 2_500_000,
      variableVatShare: 0.15,
      fixedExpensesGross: 3_500_000,
      fixedVatShare: 0.20,
      employeeCount: 3,
      employeePayrollTaxes: 450_000,
      distributeProfitsToOwner: true,
    },
  },
  {
    id: 'wholesale_vat',
    name: 'Оптовая торговля товарами',
    description: 'Оборот выше 100 млн ₽, поставщики на ОСНО с НДС 22%, маржинальность 15-20%.',
    badge: 'Опт с НДС',
    profile: {
      orgForm: 'BOTH',
      originStatus: 'EXISTING_USN',
      priorYearRevenueBand: 'FROM_20M_TO_250M',
      revenueGross: 120_000_000,
      useMonthlyDistribution: false,
      variableExpensesGross: 85_000_000,
      variableVatShare: 0.90,
      fixedExpensesGross: 14_000_000,
      fixedVatShare: 0.50,
      employeeCount: 12,
      employeePayrollTaxes: 1_800_000,
      distributeProfitsToOwner: true,
    },
  },
  {
    id: 'marketplace_retail',
    name: 'Маркетплейс и розница',
    description: 'Оборот 45 млн ₽, смешанные закупки, работа на АвтоУСН или УСН 5%.',
    badge: 'E-commerce',
    profile: {
      orgForm: 'IP',
      originStatus: 'EXISTING_USN',
      priorYearRevenueBand: 'FROM_20M_TO_250M',
      revenueGross: 45_000_000,
      useMonthlyDistribution: false,
      variableExpensesGross: 28_000_000,
      variableVatShare: 0.40,
      fixedExpensesGross: 6_000_000,
      fixedVatShare: 0.30,
      employeeCount: 4,
      employeePayrollTaxes: 480_000,
      distributeProfitsToOwner: true,
    },
  },
  {
    id: 'large_trading',
    name: 'Крупный торговый дом (320 млн)',
    description: 'Оборот в зоне 272.5–490.5 млн ₽. Переход на ставку НДС 7% либо вычет 22%.',
    badge: 'Крупный бизнес',
    profile: {
      orgForm: 'OOO',
      originStatus: 'EXISTING_USN',
      priorYearRevenueBand: 'FROM_250M_TO_450M',
      revenueGross: 320_000_000,
      useMonthlyDistribution: false,
      variableExpensesGross: 255_000_000,
      variableVatShare: 0.95,
      fixedExpensesGross: 35_000_000,
      fixedVatShare: 0.60,
      employeeCount: 35,
      employeePayrollTaxes: 4_200_000,
      distributeProfitsToOwner: true,
    },
  },
  {
    id: 'new_business',
    name: 'Новый бизнес 2026 года',
    description: 'Регистрация в 2026 г., гарантированное освобождение по ст. 145 до 20 млн ₽.',
    badge: 'Старт 2026',
    profile: {
      orgForm: 'IP',
      originStatus: 'NEW_BUSINESS_2026',
      priorYearRevenueBand: 'UP_TO_20M',
      revenueGross: 15_000_000,
      useMonthlyDistribution: false,
      variableExpensesGross: 6_000_000,
      variableVatShare: 0.30,
      fixedExpensesGross: 2_500_000,
      fixedVatShare: 0.20,
      employeeCount: 0,
      employeePayrollTaxes: 0,
      distributeProfitsToOwner: true,
    },
  },
];
