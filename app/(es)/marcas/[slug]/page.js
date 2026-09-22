import { notFound } from 'next/navigation';
import { Shell } from '@/components/ui';
import { Brand } from '@/components/pages';
import { BRANDS, bySlug } from '@/lib/brands';
import { alternates } from '@/lib/site';

export const dynamicParams = false;
export const generateStaticParams = () => BRANDS.filter((b) => b.page).map((b) => ({ slug: b.slug }));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = bySlug(slug);
  return {
    title: `Creadora UGC para ${b.name} · Mahola`,
    description: `${b.es.t}. ${b.es.p}`.slice(0, 158),
    alternates: alternates(`/marcas/${slug}`, `/en/brands/${slug}`, 'es'),
    openGraph: { images: [`/ugc/${slug}-1.webp`] },
  };
}
export default async function Page({ params }) {
  const { slug } = await params;
  if (!bySlug(slug)?.page) notFound();
  return <Shell lang="es" other={`/en/brands/${slug}`}><Brand slug={slug} lang="es" /></Shell>;
}
