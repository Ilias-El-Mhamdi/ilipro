// Cloudflare Pages Function, exécutée uniquement sur « / » : redirige vers la locale préférée du navigateur.
// 302 (et non 301) + Vary, sinon navigateurs et caches figeraient la première langue servie.
// Sans Accept-Language (Googlebot, aperçus de lien), on sert la locale par défaut.
const supported = ['fr', 'en'];
const fallback = 'fr';

function pickLocale(header: string | null): string {
  if (!header) return fallback;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.toLowerCase().split('-')[0] ?? '', q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.find((entry) => supported.includes(entry.lang))?.lang ?? fallback;
}

export const onRequest = ({ request }: { request: Request }): Response => {
  const url = new URL(request.url);
  const target = new URL(`/${pickLocale(request.headers.get('Accept-Language'))}/${url.search}`, url);
  return new Response(null, {
    status: 302,
    headers: { Location: target.toString(), Vary: 'Accept-Language' },
  });
};
