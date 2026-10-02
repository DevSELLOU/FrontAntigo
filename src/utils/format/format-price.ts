export function formatCurrencyMask(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) {
    return '';
  }

  return Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyMask(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const str = value.replace(/[R$\s]/g, '').trim();
  
  if (str === '') {
    return null;
  }

  const lastCommaIndex = str.lastIndexOf(',');
  const lastDotIndex = str.lastIndexOf('.');

  let normalized: string;

  if (lastCommaIndex > lastDotIndex) {
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = str.replace(/,/g, '');
  }

  const parsed = parseFloat(normalized);

  return isNaN(parsed) ? null : parsed;
}