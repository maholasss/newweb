import Link from 'next/link';
import { BRANDS, CATS, bySlug } from '@/lib/brands';
import { LOGOS } from '@/lib/logos';
import { T, ROUTES, EMAIL, IG, TIKTOK, CREDIT } from '@/lib/site';

// Logo de marca: SVG/PNG si lo tenemos, si no el nombre en serif
export function Mark({ slug }) {
  const b = bySlug(slug);
  const file = LOGOS[slug];
  if (file) {
    return (
      <span className="mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${file}`} alt={b.name} loading="lazy" />
      </span>
    );
  }
  return <span className="mark mark--text">{b.name}</span>;
}

export function Header({ lang, other }) {
  const t = T[lang].nav;
  const r = (k) => ROUTES[k][lang];
  const links = (
    <>
      <Link href={r('portfolio')}>{t.portfolio}</Link>
      <Link href={r('about')}>{t.about}</Link>
      <Link href={other} className="lang" hrefLang={lang === 'es' ? 'en' : 'es'} aria-label={t.otherLabel}>{t.other}</Link>
      <Link href={r('contact')} className="btn btn--dark"><span>{t.cta}</span></Link>
    </>
  );
  return (
    <header className="hdr">
      <div className="wrap">
        <Link href={r('home')} className="logo">Mahola</Link>
        <nav className="nav">{links}</nav>
        <details className="mnav">
          <summary>Menu</summary>
          <nav className="mnav-panel">{links}</nav>
        </details>
      </div>
    </header>
  );
}

export function Footer({ lang }) {
  const t = T[lang];
  const r = (k) => ROUTES[k][lang];
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div>
            <Link href={r('home')} className="logo">Mahola</Link>
            <p>{t.footer.tagline}</p>
          </div>
          <div className="foot-links">
            <div>
              <Link href={r('portfolio')}>{t.nav.portfolio}</Link>
              <Link href={r('about')}>{t.nav.about}</Link>
              <Link href={r('contact')}>{t.nav.contact}</Link>
            </div>
            <div>
              <a href={IG} target="_blank" rel="noopener">Instagram</a>
              <a href={TIKTOK} target="_blank" rel="noopener">TikTok</a>
              <a href={`mailto:${EMAIL}`}>Email</a>
            </div>
          </div>
        </div>
        <div className="foot-end">
          <span>© {new Date().getFullYear()} Mahola · {t.footer.rights}</span>
          <span>{t.footer.by} <a href={CREDIT} target="_blank" rel="noopener">Gorka Di Capitán</a></span>
        </div>
      </div>
    </footer>
  );
}

export function Trusted({ lang }) {
  const list = (
    <ul>
      {BRANDS.map((b) => <li key={b.slug}><Mark slug={b.slug} /></li>)}
    </ul>
  );
  return (
    <section className="trusted" aria-label={T[lang].trusted}>
      <p>{T[lang].trusted}</p>
      <div className="marquee">
        {list}
        <div aria-hidden="true">{list}</div>
      </div>
    </section>
  );
}

export function Cta({ lang }) {
  const t = T[lang];
  return (
    <section className="wrap" style={{ paddingBottom: 'clamp(60px, 8vw, 100px)' }}>
      <div className="cta">
        <h2 className="h2">{t.ctaH2}</h2>
        <p>{t.ctaP}</p>
        <Link href={ROUTES.contact[lang]} className="btn"><span>{t.ctaBtn}</span></Link>
        <a className="cta-mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </div>
    </section>
  );
}

export const catLabel = (cat, lang) => CATS[cat][lang];

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function Shell({ lang, other, children }) {
  return (
    <>
      <Header lang={lang} other={other} />
      <main>{children}</main>
      <Footer lang={lang} />
    </>
  );
}
