import { LegislationParams } from '../types';

export interface IpContributionsBreakdown {
  fixedPart: number;
  variablePart: number;
  totalIpContributions: number;
}

/**
 * Расчет взносов ИП за себя (ст. 430 НК РФ)
 */
export function calculateIpContributions(
  revenueGross: number,
  params: LegislationParams
): IpContributionsBreakdown {
  const fixedPart = params.ipFixedContribution;
  let variablePart = 0;
  
  if (revenueGross > params.ip1PercentThreshold) {
    const raw1Percent = (revenueGross - params.ip1PercentThreshold) * 0.01;
    variablePart = Math.min(raw1Percent, params.ipMaxVariableContribution);
  }
  
  const totalIpContributions = Math.min(fixedPart + variablePart, params.ipMaxTotalContribution);

  return {
    fixedPart,
    variablePart,
    totalIpContributions,
  };
}

/**
 * Расчет налогового вычета по страховым взносам на УСН «Доходы»
 * Для ИП без работников — до 100% исчисленного налога!
 * Для ИП с работниками и для ООО — не более 50% исчисленного налога.
 */
export function calculateUsnIncomeDeduction(
  orgForm: 'IP' | 'OOO',
  calculatedTax: number,
  ipSelfContributions: number,
  employeePayrollTaxes: number,
  employeeCount: number
): { deduction: number; maxAllowedDeduction: number; isFullDeduction: boolean } {
  if (calculatedTax <= 0) {
    return { deduction: 0, maxAllowedDeduction: 0, isFullDeduction: false };
  }

  if (orgForm === 'IP') {
    if (employeeCount === 0) {
      // 100% вычет взносов ИП за себя!
      const deduction = Math.min(ipSelfContributions, calculatedTax);
      return {
        deduction,
        maxAllowedDeduction: calculatedTax,
        isFullDeduction: true,
      };
    } else {
      // 50% ограничение: взносы ИП + взносы за работников
      const maxAllowedDeduction = calculatedTax * 0.50;
      const totalAvailableContributions = ipSelfContributions + employeePayrollTaxes;
      const deduction = Math.min(totalAvailableContributions, maxAllowedDeduction);
      return {
        deduction,
        maxAllowedDeduction,
        isFullDeduction: false,
      };
    }
  } else {
    // Для ООО: уменьшение налога только на взносы за сотрудников, не более 50%
    const maxAllowedDeduction = calculatedTax * 0.50;
    const deduction = Math.min(employeePayrollTaxes, maxAllowedDeduction);
    return {
      deduction,
      maxAllowedDeduction,
      isFullDeduction: false,
    };
  }
}
