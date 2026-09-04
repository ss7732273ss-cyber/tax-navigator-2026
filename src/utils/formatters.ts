export function formatRubles(val: number): string {
  if (isNaN(val)) return '0 ₽';
  return Math.round(val).toLocaleString('ru-RU') + ' ₽';
}

export function formatCompactRubles(val: number): string {
  if (isNaN(val)) return '0 ₽';
  const abs = Math.abs(val);
  const sign = val < 0 ? '−' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(2).replace('.00', '')} млрд ₽`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2).replace('.00', '')} млн ₽`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)} тыс. ₽`;
  }
  return `${sign}${Math.round(abs).toLocaleString('ru-RU')} ₽`;
}

export function formatPercent(val: number, decimals = 1): string {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}
