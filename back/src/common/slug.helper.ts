import slugify from 'slugify';

export function toSlug(name: string): string {
  return slugify(name, { lower: true, strict: true, locale: 'fr' });
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const slug = toSlug(base);
  if (!(await exists(slug))) return slug;
  let i = 2;
  while (await exists(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
