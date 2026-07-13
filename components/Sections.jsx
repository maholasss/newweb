'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   SECCIONES — parallax estilo Apple (Guía Blush & Ladrillo)
   ------------------------------------------------------------
   FOTOS: sube tus imágenes a /public/fotos/ con estos nombres
   y aparecerán solas (mientras no existan se ve un hueco de
   marca con el nombre del archivo que falta):

     /public/fotos/beauty.jpg
     /public/fotos/fashion.jpg
     /public/fotos/travel.jpg
     /public/fotos/producto-felicidad.jpg
   ============================================================ */

const BRAND = {
  white: '#FFFFFF',
  offWhite: '#FDF8F7',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

/* Foto con fallback: intenta cargar /fotos/<name>; si no existe,
   muestra el hueco de marca con el nombre del archivo. */
function Photo({ name, alt, ratio = '3 / 4', radius = 22 }) {
  const [ok, setOk] = useState(true);
  return (
    <div
      style={{
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${BRAND.blush}, ${BRAND.softPink})`,
        position: 'relative',
      }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/fotos/${name}`}
          alt={alt}
          onError={() => setOk(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: BRAND.wine,
            border: `1.5px dashed ${BRAND.dustyPink}`,
            borderRadius: radius,
            margin: 10,
          }}
        >
          <span style={{ fontSize: 26 }}>📷</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', opacity: 0.7 }}>
            /public/fotos/{name}
          </span>
        </div>
      )}
    </div>
  );
}

/* Aparece al entrar en pantalla (fade-up estilo Apple) */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setOn(true),
      { threshold: 0.18 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(34px)',
        transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* Parallax suave: el hijo se desplaza a distinta velocidad que el scroll */
function Parallax({ speed = 0.12, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${-mid * speed}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);
  return (
    <div ref={ref} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

const PILLARS = [
  {
    name: 'beauty.jpg',
    label: 'Beauty',
    text: 'Skincare y maquillaje dentro de escenas reales — la rutina de mañana con música, no una review con guion.',
  },
  {
    name: 'fashion.jpg',
    label: 'Fashion',
    text: 'La ropa nueva en un momento random y divertido. Espontáneo, pero con una estética cuidada.',
  },
  {
    name: 'travel.jpg',
    label: 'Travel',
    text: 'Explorar lugares con curiosidad genuina y compartirlos como una amiga por WhatsApp.',
  },
];

export default function Sections() {
  return (
    <div style={{ background: BRAND.white, color: BRAND.wine }}>
      {/* ---------- MANIFIESTO ---------- */}
      <section
        id="trabajo"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18vh 6vw',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <p
            style={{
              fontWeight: 300,
              fontSize: 'clamp(1.6rem, 3.6vw, 3rem)',
              lineHeight: 1.35,
              maxWidth: 900,
              margin: 0,
            }}
          >
            La vida es mejor —{' '}
            <span style={{ color: BRAND.brick, fontWeight: 600 }}>y más divertida</span> — con
            los productos adecuados. Eso es lo que cuento en cada vídeo.
          </p>
        </Reveal>
      </section>

      {/* ---------- PILARES (parallax alternado) ---------- */}
      {PILLARS.map((pillar, i) => {
        const reversed = i % 2 === 1;
        return (
          <section
            key={pillar.label}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(28px, 6vw, 90px)',
              alignItems: 'center',
              maxWidth: 1150,
              margin: '0 auto',
              padding: 'clamp(60px, 10vh, 120px) 6vw',
              direction: reversed ? 'rtl' : 'ltr',
            }}
          >
            <div style={{ direction: 'ltr' }}>
              <Parallax speed={0.1}>
                <Photo name={pillar.name} alt={pillar.label} />
              </Parallax>
            </div>
            <div style={{ direction: 'ltr' }}>
              <Reveal delay={0.1}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: BRAND.dustyPink,
                    margin: '0 0 14px',
                  }}
                >
                  0{i + 1} — Pilar
                </p>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                    margin: '0 0 18px',
                  }}
                >
                  {pillar.label}
                </h2>
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
                    lineHeight: 1.7,
                    maxWidth: 440,
                    margin: 0,
                    opacity: 0.85,
                  }}
                >
                  {pillar.text}
                </p>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ---------- PRODUCTO + FELICIDAD (bloque blush) ---------- */}
      <section
        style={{
          background: BRAND.offWhite,
          padding: 'clamp(70px, 12vh, 140px) 6vw',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(28px, 6vw, 90px)',
            alignItems: 'center',
            maxWidth: 1150,
            margin: '0 auto',
          }}
        >
          <Reveal>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: BRAND.dustyPink,
                margin: '0 0 14px',
              }}
            >
              La fórmula
            </p>
            <h2
              style={{
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                lineHeight: 1.1,
                margin: '0 0 20px',
              }}
            >
              Producto + felicidad
            </h2>
            <p
              style={{
                fontWeight: 300,
                fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)',
                lineHeight: 1.7,
                maxWidth: 480,
                margin: 0,
              }}
            >
              Lo que mejor funciona no es el producto solo ni yo sola: es el cruce. Tu producto
              dentro de mi vida real — bailando, riendo, disfrutando. La gente conecta con la
              alegría, y tu marca se queda con esa conexión.
            </p>
          </Reveal>
          <Parallax speed={0.08}>
            <Photo name="producto-felicidad.jpg" alt="Producto en la vida real de Mahola" ratio="4 / 5" />
          </Parallax>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section
        style={{
          padding: 'clamp(90px, 16vh, 180px) 6vw',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <h2
            style={{
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.6rem)',
              margin: '0 0 16px',
            }}
          >
            ¿Creamos algo juntas?
          </h2>
          <p
            style={{
              fontWeight: 300,
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              margin: '0 0 34px',
              opacity: 0.8,
            }}
          >
            Contenido UGC para beauty, fashion y travel — auténtico, espontáneo y con criterio.
          </p>
          <a
            href="mailto:hola@mahola.com" /* <-- CAMBIA por el email real */
            style={{
              display: 'inline-block',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.06em',
              color: BRAND.white,
              background: BRAND.brick,
              borderRadius: 999,
              padding: '18px 44px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(184,87,76,0.35)',
            }}
          >
            Trabaja conmigo
          </a>
        </Reveal>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer
        style={{
          borderTop: `1px solid ${BRAND.blush}`,
          padding: '28px 6vw',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          opacity: 0.75,
        }}
      >
        <span style={{ fontWeight: 600 }}>Mahola</span>
        <span>
          {/* CAMBIA los enlaces por los perfiles reales */}
          <a href="#" style={{ color: BRAND.wine, marginRight: 18 }}>Instagram</a>
          <a href="#" style={{ color: BRAND.wine }}>TikTok</a>
        </span>
        <span>© {new Date().getFullYear()} Mahola — creadora UGC</span>
      </footer>
    </div>
  );
}
