/** تنسيق توقيت ISO للعرض بالعربية (تقويم ميلادي) */
export function formatNewsDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      calendar: 'gregory',
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return d.toLocaleString('ar-SA')
  }
}
