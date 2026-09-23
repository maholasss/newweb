import Link from 'next/link';
import { SITE, EMAIL, IG, TIKTOK, YOUTUBE, FACEBOOK, CREDIT } from '@/lib/site';

export const metadata = {
  title: 'Mahola · Enlaces',
  description: 'Todos los enlaces de Mahola: portfolio, Instagram, TikTok, YouTube y contacto para marcas.',
  alternates: { canonical: `${SITE}/links` },
  robots: { index: false },
};

const LINKS = [
  ['Portfolio', 'Los vídeos, marca por marca', '/portfolio'],
  ['Trabajemos juntas', 'Colaboraciones y campañas', '/contacto'],
  ['Sobre mí', 'Quién soy y cómo trabajo', '/sobre-mi'],
  ['Instagram', '@maholasss', IG],
  ['TikTok', '@maholasss', TIKTOK],
  ['YouTube', '@maholasss', YOUTUBE],
  ['Facebook', 'Mahola', FACEBOOK],
  ['Email', EMAIL, `mailto:${EMAIL}`],
];

export default function Page() {
  return (
    <main className="links">
      <img className="links-face" src="/fotos/perfil-cara.avif" alt="Mahola" />
      <h1>Mahola</h1>
      <p className="links-tag">Creadora de contenido UGC · Valencia</p>
      <nav className="links-list">
        {LINKS.map(([t, s, href]) => {
          const out = href.startsWith('http') || href.startsWith('mailto');
          const inner = (
            <>
              <span><b>{t}</b><small>{s}</small></span>
              <i aria-hidden="true">→</i>
            </>
          );
          return out ? (
            <a key={t} href={href} target="_blank" rel="noopener">{inner}</a>
          ) : (
            <Link key={t} href={href}>{inner}</Link>
          );
        })}
      </nav>
      <p className="links-credit">
        Fotografía, vídeo y web por <a href={CREDIT} target="_blank" rel="noopener">Gorka Di Capitán</a>
      </p>
    </main>
  );
}
