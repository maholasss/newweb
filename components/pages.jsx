import Link from 'next/link';
import { BRANDS, FEATURED, bySlug, videos, isoDuration } from '@/lib/brands';
import { T, ROUTES, SITE, EMAIL, IG, TIKTOK, CREDIT, brandPath } from '@/lib/site';
import { Mark, Trusted, Cta, JsonLd, catLabel } from './ui';
import UgcVideo from './UgcVideo';
import Wall from './Wall';
import ContactForm from './ContactForm';

const UPLOAD = '2026-07-16';

export const person = (lang) => ({
  '@type': 'Person',
  '@id': `${SITE}/#mahola`,
  name: 'Mahola',
  alternateName: 'maholasss',
  url: SITE + ROUTES.home[lang],
  image: `${SITE}/fotos/foto-4.jpg`,
  jobTitle: lang === 'en' ? ['UGC Content Creator', 'Professional Dancer'] : ['Creadora de contenido UGC', 'Bailarina profesional'],
  email: EMAIL,
  sameAs: [IG, TIKTOK],
  knowsAbout: ['UGC', 'Skincare', 'Makeup', 'Fashion', 'Dance'],
});

const website = {
  '@type': 'WebSite',
  '@id': `${SITE}/#web`,
  url: SITE,
  name: 'Mahola',
  inLanguage: ['es', 'en'],
  creator: { '@type': 'Person', name: 'Gorka Di Capitán', url: CREDIT },
};

const videoLd = (b, lang) =>
  videos(b).map((v, i) => ({
    '@type': 'VideoObject',
    name: `${b.name} · ${b[lang].t}${b.d.length > 1 ? ` (${i + 1})` : ''}`,
    description: b[lang].p,
    thumbnailUrl: `${SITE}${v}.webp`,
    contentUrl: `${SITE}${v}.mp4`,
    uploadDate: UPLOAD,
    duration: isoDuration(b.d[i]),
    creator: { '@id': `${SITE}/#mahola` },
  }));

/* ---------------- HOME ---------------- */
export function Home({ lang }) {
  const t = T[lang];
  const heroVids = ['/ugc/cerave-1', '/ugc/loreal-paris-3', '/ugc/shein-2'];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [website, person(lang)] }} />
      <section className="hero">
        <div className="hero-blob" />
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">{t.heroEyebrow}</p>
            <h1 style={{ marginTop: 18 }}>
              <span className="hero-name">Mahola<em>.</em></span>
              <span className="hero-h1">{t.heroH1}</span>
            </h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas">
              <Link href={ROUTES.portfolio[lang]} className="btn btn--dark"><span>{t.heroCta}</span></Link>
              <Link href={ROUTES.contact[lang]} className="btn btn--ghost"><span>{t.heroCta2}</span></Link>
            </div>
            <div className="stats">
              {t.stats.map(([a, b]) => <div key={b}><b>{a}</b><span>{b}</span></div>)}
            </div>
          </div>
          <div className="phones">
            {heroVids.map((v, i) => (
              <div className="phone" key={v}><UgcVideo src={v} eager={i === 1} label="UGC" soundLabel={t.sound} /></div>
            ))}
          </div>
        </div>
      </section>

      <Trusted lang={lang} />

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">{t.whatEyebrow}</p>
            <h2 className="h2">{t.whatH2}</h2>
            <p className="lead">{t.whatP}</p>
          </div>
          <div className="what-grid">
            {t.what.map(([h, p], i) => (
              <article className="what-card reveal" key={h} style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="n">0{i + 1}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
          <div className="steps">
            {t.steps.map(([h, p], i) => (
              <div className="step reveal" key={h} style={{ transitionDelay: `${i * 0.08}s` }}>
                <b>{h}</b>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec zz">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">{t.zzEyebrow}</p>
            <h2 className="h2">{t.zzH2}</h2>
          </div>
          <div>
            {FEATURED.map((s, i) => {
              const b = bySlug(s);
              return (
                <article className="zz-row" key={s}>
                  <div className="zz-media">
                    <span className="zz-ghost" aria-hidden="true">{b.name}</span>
                    <div className="zz-phone reveal">
                      <UgcVideo src={videos(b)[0]} label={`${b.name}: ${b[lang].t}`} soundLabel={t.sound} />
                    </div>
                  </div>
                  <div className="zz-text reveal">
                    <span className="zz-idx">0{i + 1} / 0{FEATURED.length}</span>
                    <Mark slug={s} />
                    <span className="chip">{catLabel(b.cat, lang)}</span>
                    <h3>{b[lang].t}</h3>
                    <p>{b[lang].p}</p>
                    <Link href={brandPath(s, lang)} className="link-arrow">{t.zzLink} · {b.name} →</Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Link href={ROUTES.portfolio[lang]} className="btn btn--dark"><span>{t.heroCta}</span></Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap about-grid">
          <div className="about-photos reveal">
            <picture><source srcSet="/fotos/foto-4.avif" type="image/avif" /><img src="/fotos/foto-4.jpg" alt="Mahola" loading="lazy" /></picture>
            <picture><source srcSet="/fotos/foto-12.avif" type="image/avif" /><img src="/fotos/foto-12.jpg" alt="Mahola" loading="lazy" /></picture>
          </div>
          <div>
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2 className="h2" style={{ marginTop: 16 }}>{t.aboutH2}</h2>
            <p className="lead">{t.aboutP}</p>
            <Link href={ROUTES.about[lang]} className="link-arrow">{t.aboutLink} →</Link>
          </div>
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}

/* ---------------- PORTFOLIO ---------------- */
export function Portfolio({ lang }) {
  const t = T[lang];
  const marks = Object.fromEntries(BRANDS.map((b) => [b.slug, <Mark key={b.slug} slug={b.slug} />]));
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t.portfolioH1,
          url: SITE + ROUTES.portfolio[lang],
          mainEntity: { '@type': 'ItemList', itemListElement: BRANDS.flatMap((b) => videoLd(b, lang)).map((v, i) => ({ '@type': 'ListItem', position: i + 1, item: v })) },
        }}
      />
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">{t.portfolioEyebrow}</p>
          <h1>{t.portfolioH1}</h1>
          <p className="lead">{t.portfolioP}</p>
        </header>
        <Wall lang={lang} marks={marks} />
      </div>
      <div style={{ height: 'clamp(60px, 8vw, 100px)' }} />
      <Cta lang={lang} />
    </>
  );
}

/* ---------------- MARCA ---------------- */
export function Brand({ slug, lang }) {
  const t = T[lang];
  const b = bySlug(slug);
  const others = BRANDS.filter((x) => x.page && x.slug !== slug);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            ...videoLd(b, lang),
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Mahola', item: SITE + ROUTES.home[lang] },
                { '@type': 'ListItem', position: 2, name: 'Portfolio', item: SITE + ROUTES.portfolio[lang] },
                { '@type': 'ListItem', position: 3, name: b.name, item: SITE + brandPath(slug, lang) },
              ],
            },
          ],
        }}
      />
      <div className="wrap">
        <section className="brand-hero">
          <div>
            <p className="eyebrow"><Link href={ROUTES.portfolio[lang]}>Portfolio</Link> · {catLabel(b.cat, lang)}</p>
            <Mark slug={slug} />
            <h1>{t.brandH1(b.name)}</h1>
            <p style={{ marginBottom: 12, color: 'var(--ink)', fontWeight: 600 }}>{b[lang].t}</p>
            <p>{b[lang].p}</p>
          </div>
          <div className="brand-vids">
            {videos(b).map((v, i) => (
              <div className="zz-phone" key={v}><UgcVideo src={v} eager={i === 0} label={`${b.name} ${i + 1}`} soundLabel={t.sound} /></div>
            ))}
          </div>
        </section>
        <section style={{ padding: '30px 0 80px', display: 'grid', gap: 18 }}>
          <p className="eyebrow">{t.otherBrands}</p>
          <div className="chips">
            {others.map((o) => <Link key={o.slug} href={brandPath(o.slug, lang)}>{o.name}</Link>)}
            <Link href={ROUTES.portfolio[lang]}>{t.all} →</Link>
          </div>
        </section>
      </div>
      <Cta lang={lang} />
    </>
  );
}

/* ---------------- SOBRE MÍ ---------------- */
const ABOUT = {
  es: [
    'Soy <strong>Mahola</strong>, bailarina profesional y creadora de contenido UGC. Grabo vídeos para marcas de skincare, maquillaje, perfume, pelo y moda desde mi día a día.',
    'El baile me ha dado lo que más se nota en un vídeo corto: <strong>ritmo, expresión y soltura delante de la cámara</strong>. Sé cuánto dura un gesto, cuándo cortar y cómo hacer que alguien se quede hasta el final.',
    'He trabajado con más de veinticinco marcas, de CeraVe, L’Oréal Paris y Vichy a Mugler, SHEIN o Garnier. Grabo en español y en inglés.',
    'Si tu marca busca contenido que se vea real y que venda, <strong>hablemos</strong>.',
  ],
  en: [
    'I’m <strong>Mahola</strong>, a professional dancer and UGC content creator. I film videos for skincare, makeup, fragrance, haircare and fashion brands from my everyday life.',
    'Dance gave me what shows most in short-form video: <strong>rhythm, expression and ease in front of the camera</strong>. I know how long a gesture lasts, when to cut and how to keep someone watching to the end.',
    'I’ve worked with more than twenty-five brands, from CeraVe, L’Oréal Paris and Vichy to Mugler, SHEIN and Garnier. I film in Spanish and English.',
    'If your brand wants content that looks real and sells, <strong>let’s talk</strong>.',
  ],
};
export function About({ lang }) {
  const t = T[lang];
  const pics = [4, 1, 3, 9, 11];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: SITE + ROUTES.about[lang], mainEntity: person(lang) }} />
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">{t.aboutEyebrow}</p>
          <h1>{t.aboutH1}</h1>
        </header>
        <div className="about-page">
          <div className="about-gallery">
            {pics.map((n, i) => (
              <picture key={n}><source srcSet={`/fotos/foto-${n}.avif`} type="image/avif" /><img src={`/fotos/foto-${n}.jpg`} alt="Mahola" loading={i ? 'lazy' : 'eager'} /></picture>
            ))}
          </div>
          <div className="prose">
            {ABOUT[lang].map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
            <div style={{ marginTop: 10 }}><Link href={ROUTES.contact[lang]} className="btn btn--dark"><span>{t.nav.cta}</span></Link></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- CONTACTO ---------------- */
export function Contact({ lang }) {
  const t = T[lang];
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="eyebrow">{t.nav.contact}</p>
        <h1>{t.contactH1}</h1>
      </header>
      <div className="contact-grid">
        <div>
          <p className="lead">{t.contactP}</p>
          <div className="contact-list">
            <a href={`mailto:${EMAIL}`}>{EMAIL} <span>→</span></a>
            <a href={IG} target="_blank" rel="noopener">Instagram · @maholasss <span>→</span></a>
            <a href={TIKTOK} target="_blank" rel="noopener">TikTok · @maholasss <span>→</span></a>
          </div>
        </div>
        <ContactForm lang={lang} />
      </div>
    </div>
  );
}
