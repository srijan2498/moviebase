export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatMoney(amount: number | null | undefined): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

export function formatNumber(n: number | null | undefined): string {
  if (!n) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return 'N/A';
  return rating.toFixed(1);
}

export function formatVoteCount(count: number | null | undefined): string {
  if (!count) return '';
  return `(${formatNumber(count)})`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}
