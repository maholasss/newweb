import { SITE } from '@/lib/site';

export default function robots() {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE}/sitemap.xml` };
}
