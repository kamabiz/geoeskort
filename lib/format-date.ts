export function formatDateKa(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
