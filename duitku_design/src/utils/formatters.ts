export function formatRupiah(amount: number, prefix: string = 'Rp'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${prefix}0`;
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('id-ID');
  return `${isNegative ? '-' : ''}${prefix}${formatted}`;
}

export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'IDR 0';
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('id-ID');
  return `${isNegative ? '-' : ''}IDR ${formatted}`;
}

export function formatCompactNumber(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} rb`;
  }
  return amount.toString();
}

export function getTodayDateString(): string {
  const date = new Date();
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getMonthYearString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
