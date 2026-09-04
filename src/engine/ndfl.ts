import { LegislationParams } from '../types';

/**
 * Прогрессивная 5-ступенчатая шкала НДФЛ для индивидуального предпринимателя на ОСНО
 * До 2.4 млн — 13%
 * 2.4 - 5.0 млн — 15%
 * 5.0 - 20.0 млн — 18%
 * 20.0 - 50.0 млн — 20%
 * Свыше 50.0 млн — 22%
 */
export function calculatePersonalNdflScale(
  taxableIncome: number,
  params: LegislationParams
): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let remaining = taxableIncome;
  let previousThreshold = 0;

  for (const bracket of params.ndflBrackets) {
    if (taxableIncome > previousThreshold) {
      const taxableInThisBracket = Math.min(
        remaining,
        bracket.threshold === Infinity ? remaining : bracket.threshold - previousThreshold
      );
      tax += taxableInThisBracket * bracket.rate;
      remaining -= taxableInThisBracket;
      previousThreshold = bracket.threshold;
      if (remaining <= 0) break;
    }
  }

  return tax;
}

/**
 * Изолированная 2-ступенчатая шкала НДФЛ с дивидендов резидентов РФ (ООО):
 * 13% — в пределах 2 400 000 ₽ в год
 * 15% — с суммы превышения 2 400 000 ₽
 * Не смешивается с основной пятиступенчатой шкалой других доходов.
 */
export function calculateDividendNdfl(
  netProfitToDistribute: number,
  params: LegislationParams
): { dividendTax: number; netCashInHand: number } {
  if (netProfitToDistribute <= 0) {
    return { dividendTax: 0, netCashInHand: 0 };
  }

  const threshold = params.dividendBracketThreshold; // 2 400 000 ₽
  let dividendTax = 0;

  if (netProfitToDistribute <= threshold) {
    dividendTax = netProfitToDistribute * params.dividendRateBelow;
  } else {
    dividendTax =
      threshold * params.dividendRateBelow +
      (netProfitToDistribute - threshold) * params.dividendRateAbove;
  }

  const netCashInHand = Math.max(0, netProfitToDistribute - dividendTax);
  return { dividendTax, netCashInHand };
}
