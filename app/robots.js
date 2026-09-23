import { SITE } from '@/lib/site';

export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/ficha/', '/seleccion/'] }, sitemap: `${SITE}/sitemap.xml` };
}
