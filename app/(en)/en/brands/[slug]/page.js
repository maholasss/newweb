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
    title: `Videos for ${b.name} · Mahola`,
    description: `${b.en.t}. ${b.en.p}`.slice(0, 158),
    alternates: alternates(`/marcas/${slug}`, `/en/brands/${slug}`, 'en'),
    openGraph: { images: [`/ugc/${slug}-1.webp`] },
  };
}
export default async function Page({ params }) {
  const { slug } = await params;
  if (!bySlug(slug)?.page) notFound();
  return <Shell lang="en" other={`/marcas/${slug}`}><Brand slug={slug} lang="en" /></Shell>;
}
