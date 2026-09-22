import { BRANDS, videos } from '@/lib/brands';
import { SITE, ROUTES } from '@/lib/site';

export default function sitemap() {
  const pairs = [
    ...Object.values(ROUTES).map((r) => [r.es, r.en, null]),
    ...BRANDS.filter((b) => b.page).map((b) => [`/marcas/${b.slug}`, `/en/brands/${b.slug}`, b]),
  ];
  return pairs.flatMap(([es, en, b]) =>
    [es, en].map((u) => ({
      url: SITE + (u === '/' ? '' : u),
      alternates: { languages: { es: SITE + es, en: SITE + en } },
      ...(b ? { videos: videos(b).map((v) => ({ title: `${b.name} UGC · Mahola`, thumbnail_loc: `${SITE}${v}.webp`, description: b.es.t, content_loc: `${SITE}${v}.mp4` })) } : {}),
    }))
  );
}
