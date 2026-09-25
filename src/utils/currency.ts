/**
 * Currency utility functions for Philippine Peso (₱)
 */

export function formatPeso(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₱0';
  }

  // Round to 2 decimal places to avoid floating point issues
  const cleanAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

  if (showDecimals || cleanAmount % 1 !== 0) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cleanAmount);
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanAmount);
}

export function parsePeso(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100);
  }

  if (!value) return 0;

  // Remove currency signs, commas, whitespace
  const sanitized = value.toString().replace(/[₱,\s]/g, '').trim();
  const parsed = parseFloat(sanitized);

  if (isNaN(parsed)) return 0;
  return Math.max(0, Math.round((parsed + Number.EPSILON) * 100) / 100);
}
