import Link from 'next/link';
import { BRANDS, FEATURED, bySlug, videos, isoDuration } from '@/lib/brands';
import { T, ROUTES, SITE, EMAIL, IG, TIKTOK, YOUTUBE, FACEBOOK, CREDIT, brandPath } from '@/lib/site';
import { Mark, Trusted, Cta, JsonLd, catLabel } from './ui';
import UgcVideo from './UgcVideo';
import Wall from './Wall';
import ContactForm from './ContactForm';
import { Rail, Pinned, Words, Full } from './AboutScroll';

const UPLOAD = '2026-07-16';

export const person = (lang) => ({
  '@type': 'Person',
  '@id': `${SITE}/#mahola`,
  name: 'Mahola',
  alternateName: 'maholasss',
  url: SITE + ROUTES.home[lang],
  image: `${SITE}/fotos/foto-4.avif`,
  jobTitle: lang === 'en' ? ['UGC Content Creator', 'Professional Dancer'] : ['Creadora de contenido UGC', 'Bailarina profesional'],
  email: EMAIL,
  sameAs: [IG, TIKTOK, YOUTUBE, FACEBOOK],
  knowsAbout: ['UGC', 'Skincare', 'Makeup', 'Fashion', 'Fragrance', 'Dance'],
  knowsLanguage: ['es', 'en'],
  address: { '@type': 'PostalAddress', addressLocality: 'Valencia', addressCountry: 'ES' },
  areaServed: [{ '@type': 'Country', name: 'España' }, { '@type': 'Country', name: 'United Kingdom' }],
});

const website = {
  '@type': 'WebSite',
  '@id': `${SITE}/#web`,
  url: SITE,
  name: 'Mahola',
  inLanguage: ['es', 'en'],
  creator: { '@type': 'Person', name: 'Gorka Di Capitán', url: CREDIT },
};

const gorka = { '@type': 'Person', name: 'Gorka Di Capitán', url: CREDIT };

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
    ...(b.videoCredit ? { producer: gorka, copyrightHolder: gorka } : {}),
  }));

/* ---------------- HOME ---------------- */
export function Home({ lang }) {
  const t = T[lang];
  const heroItems = [
    { img: '/fotos/hero-blanco-4', alt: 'Mahola en una sesión de retrato' },
    { v: '/ugc/huda-beauty-1' },
    { img: '/fotos/hero-shein', alt: 'Mahola en una sesión para SHEIN' },
  ];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [website, person(lang)] }} />
      <section className="hero">
        <div className="hero-blob" />
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow hero-in" style={{ '--d': '0.05s' }}>{t.heroEyebrow}</p>
            <h1 style={{ marginTop: 18 }}>
              <span className="hero-name" aria-label="Mahola">
                {'Mahola'.split('').map((c, i) => (
                  <span key={i} className="ch" style={{ '--d': `${0.06 * i + 0.15}s` }} aria-hidden="true">{c}</span>
                ))}
                <em className="ch" style={{ '--d': '0.55s' }} aria-hidden="true">.</em>
              </span>
              <span className="hero-h1 hero-in" style={{ '--d': '0.6s' }}>{t.heroH1}</span>
            </h1>
            <p className="hero-sub hero-in" style={{ '--d': '0.7s' }}>{t.heroSub}</p>
            <div className="hero-ctas hero-in" style={{ '--d': '0.8s' }}>
              <Link href={ROUTES.portfolio[lang]} className="btn btn--dark"><span>{t.heroCta}</span></Link>
              <Link href={ROUTES.contact[lang]} className="btn btn--ghost"><span>{t.heroCta2}</span></Link>
            </div>
            <div className="stats hero-in" style={{ '--d': '0.9s' }}>
              {t.stats.map(([a, b]) => <div key={b}><b>{a}</b><span>{b}</span></div>)}
            </div>
          </div>
          <div className="phones">
            {heroItems.map((it, i) => (
              <div className="phone hero-in" key={it.v || it.img} style={{ '--d': `${0.5 + i * 0.12}s` }}>
                {it.v ? (
                  <UgcVideo src={it.v} eager={i === 1} label="UGC" soundLabel={t.sound} />
                ) : (
                  <img src={`${it.img}.avif`} alt={it.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
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
            <p className="plain">{t.whatPlain}</p>
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
            <img src="/fotos/foto-4.avif" alt="Mahola" loading="lazy" />
            <img src="/fotos/foto-12.avif" alt="Mahola" loading="lazy" />
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
        <h2 className="sr-h2">{t.wallH2}</h2>
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
          {b.videoCredit && (
            <p className="credit credit--video">{t.videoBy} <a href={CREDIT} target="_blank" rel="noopener">Gorka Di Capitán</a></p>
          )}
        </section>
        <h2 className="sr-h2">{t.brandVids}</h2>
        {(b.campaigns || b.since || b.fav) && (
          <dl className="brand-facts">
            {b.campaigns ? (<div><dt>{t.facts.campaigns}</dt><dd>{b.campaigns}</dd></div>) : null}
            {b.since ? (<div><dt>{t.facts.since}</dt><dd>{b.since}</dd></div>) : null}
            {b.tipo ? (<div><dt>{t.facts.tipo}</dt><dd style={{ fontSize: '1.15rem', fontFamily: 'var(--sans)' }}>{b.tipo[lang]}</dd></div>) : null}
            <div><dt>{t.facts.videos}</dt><dd>{b.d.length}</dd></div>
            {b.fav ? (<div className="wide"><dt>{t.facts.fav}</dt><dd>{b.fav[lang]}</dd></div>) : null}
          </dl>
        )}
        {b.photos && (
          <section className="brand-photos">
            {b.photos.map((n, i) => (
              <img key={n} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }} src={`/fotos/${n}.avif`} alt={`${b.name} · Mahola`} loading="lazy" />
            ))}
          </section>
        )}
        {b.photoCredit && (
          <p className="credit">{t.photoBy} <a href={CREDIT} target="_blank" rel="noopener">Gorka Di Capitán</a></p>
        )}
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
// Cada foto lleva su trozo de texto y entra desde un lado al bajar
const STORY = {
  es: [
    ['retrato-3', 'Soy Mahola', 'Creadora de contenido en Valencia desde 2019. No me limito a enseñar un producto: monto una historia alrededor y hago que la marca sea parte de mi mundo.'],
    ['retrato-7', 'Vengo de la danza', 'Años de formación artística que salen en cada vídeo: expresión, movimiento, interpretación y saber transmitir algo delante de una cámara. Eso le da otra dimensión al contenido.'],
    ['foto-4', 'Más de 60 campañas desde 2019', 'Embajadora de Lancôme, Mugler y Cacharel, e influencer de SHEIN. También CeraVe, L’Oréal Paris, Vichy, Garnier o Huda Beauty. Beauty sobre todo, y moda, perfume, pelo y lifestyle.'],
    ['retrato-9', 'Del móvil al estudio', 'Hay campañas que piden el móvil y la cocina de casa, y otras que piden estudio, luz y un fotógrafo detrás. Trabajo con las dos y te digo cuál le conviene a tu producto.'],
    ['retrato-1', 'No me encasillo', 'Beauty, moda, lifestyle, pelo, perfumes. Quiero que la gente me siga por mí y por cómo cuento las cosas, no por un solo nicho. Grabo en español y en inglés.'],
    ['foto-12', 'Hablemos', 'Lo que quiero es que una marca piense “me gusta cómo cuenta las cosas, a ver qué haría con lo nuestro”. Si es tu caso, escríbeme.'],
  ],
  en: [
    ['retrato-3', 'I’m Mahola', 'A content creator based in Valencia since 2019. I don’t just show a product: I build a story around it and make the brand part of my world.'],
    ['retrato-7', 'I come from dance', 'Years of artistic training that show up in every video: expression, movement, performance and knowing how to put something across on camera. That gives the content another dimension.'],
    ['foto-4', 'More than 60 campaigns since 2019', 'Brand ambassador for Lancôme, Mugler and Cacharel, and a SHEIN influencer. Also CeraVe, L’Oréal Paris, Vichy, Garnier and Huda Beauty. Mostly beauty, plus fashion, fragrance, haircare and lifestyle.'],
    ['retrato-9', 'From phone to studio', 'Some campaigns call for a phone and my own kitchen, others for a studio, proper lighting and a photographer. I work both ways and I will tell you which suits your product.'],
    ['retrato-1', 'I don’t box myself in', 'Beauty, fashion, lifestyle, haircare, fragrance. I want people to follow me for me and for how I tell things, not for one niche. I film in Spanish and English.'],
    ['foto-12', 'Let’s talk', 'What I want is for a brand to think “I like how she tells things, let’s see what she’d do with ours”. If that’s you, write to me.'],
  ],
};

export function About({ lang }) {
  const t = T[lang];
  const st = STORY[lang];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: SITE + ROUTES.about[lang], mainEntity: person(lang) }} />

      {/* bloque 1: foto a pantalla completa con parallax */}
      <Full first photo="retrato-3" kicker={t.aboutEyebrow} title={t.aboutH1} text={st[0][2]} />

      {/* bloque 2: corte, la fila de fotos cruza de lado a lado */}
      <Rail photos={['retrato-7', 'retrato-2', 'foto-4', 'retrato-9', 'retrato-6', 'foto-12', 'retrato-10', 'retrato-4']}>
        <div className="rail-head">
          <span className="story-n">01</span>
          <h2>{st[1][1]}</h2>
          <Words text={st[1][2]} />
        </div>
      </Rail>

      {/* bloque 3: otro corte a pantalla completa, en oscuro */}
      <Full dark photo="retrato-8" kicker="02" title={st[2][1]} text={st[2][2]} />

      {/* bloque 4: la foto se queda fija y los textos pasan por delante */}
      <div className="wrap">
        <Pinned photo="retrato-5" blocks={st.slice(3).map(([, h, p]) => [h, p])} />
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
        <Link href={ROUTES.contact[lang]} className="btn btn--dark"><span>{t.nav.cta}</span></Link>
      </div>
      <p className="credit credit--video" style={{ paddingBottom: 70 }}>
        {t.photoBy} <a href={CREDIT} target="_blank" rel="noopener">Gorka Di Capitán</a>
      </p>
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
            <a href={YOUTUBE} target="_blank" rel="noopener">YouTube · @maholasss <span>→</span></a>
          </div>
        </div>
        <ContactForm lang={lang} />
      </div>
      <section className="faq">
        <h2>{t.faqH2}</h2>
        <dl>
          {t.faq.map(([q, a]) => (
            <div key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        }}
      />
    </div>
  );
}
