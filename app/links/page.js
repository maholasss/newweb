'use client';

import { useState } from 'react';

/* ============================================================
   /links — Mahola (estilo Guía Blush & Ladrillo)
   Foto de perfil: sube /public/fotos/perfil.jpg y aparece sola.
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

const TAGS = ['Beauty & Skincare', 'Dance & Choreography', 'Lifestyle'];

const LINKS = [
  { label: 'Portfolio', url: 'https://maholas.com' },
  { label: 'Media Kit', url: 'https://beacons.ai/maholasss/mediakit' },
  { label: 'Instagram', url: 'https://www.instagram.com/maholasss' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@maholasss' },
];

const RATES = [
  { name: 'Instagram Post', price: 'Ask me!' },
  { name: 'Instagram Story', price: 'Ask me!' },
  { name: 'TikTok video', price: 'Ask me!' },
];

const CONTACT_EMAIL = 'hola@maholas.com'; // <-- CAMBIA por el email real

export default function LinksPage() {
  const [photoOk, setPhotoOk] = useState(true);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.white,
        color: BRAND.wine,
        display: 'flex',
        justifyContent: 'center',
        padding: '56px 20px 80px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        <style>{`
          .mh-link { transition: transform .22s ease, box-shadow .22s ease, background .22s ease; }
          .mh-link:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 28px rgba(61,36,34,0.14); background: rgba(255,255,255,0.95) !important; }
          .mh-brick:hover { background: #a04c42 !important; box-shadow: 0 14px 34px rgba(184,87,76,0.45) !important; }
        `}</style>
        {/* FOTO DE PERFIL */}
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: '50%',
            margin: '0 auto 18px',
            padding: 4,
            background: `linear-gradient(140deg, ${BRAND.softPink}, ${BRAND.dustyPink})`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: BRAND.blush,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {photoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://cdn.beacons.ai/user_content/lL1TcXu16dRNiiS0bUSmdk8cKR63/profile_maholasss.png?t=1770023957435"
                alt="Mahola"
                onError={() => setPhotoOk(false)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontWeight: 700, fontSize: 40, color: BRAND.dustyPink }}>M</span>
            )}
          </div>
        </div>

        {/* NOMBRE */}
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', margin: 0 }}>
          @maholasss
        </h1>
        <p style={{ fontWeight: 400, margin: '8px 0 0', opacity: 0.8 }}>
          Mahola · Valencia, ES
        </p>

        {/* CHIPS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            margin: '20px 0 26px',
          }}
        >
          {TAGS.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: BRAND.wine,
                background: BRAND.blush,
                borderRadius: 999,
                padding: '9px 16px',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* FOLLOWERS */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: BRAND.dustyPink,
            margin: '0 0 4px',
          }}
        >
          Total followers
        </p>
        <p style={{ fontWeight: 700, fontSize: '2.2rem', margin: '0 0 30px' }}>19.7k</p>

        {/* ENLACES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
          {LINKS.map((l) => (
            <a
              key={l.label}
              className="mh-link"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '1.02rem',
                color: BRAND.wine,
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.6)',
                border: `1.5px solid ${BRAND.blush}`,
                borderRadius: 999,
                padding: '17px 20px',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                boxShadow: '0 4px 16px rgba(61,36,34,0.06)',
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            className="mh-link mh-brick"
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '1.02rem',
              color: BRAND.white,
              textDecoration: 'none',
              background: BRAND.brick,
              borderRadius: 999,
              padding: '17px 20px',
              boxShadow: '0 10px 30px rgba(184,87,76,0.3)',
            }}
          >
            Trabaja conmigo
          </a>
        </div>

        {/* ABOUT ME */}
        <div
          style={{
            textAlign: 'left',
            background: BRAND.offWhite,
            borderRadius: 22,
            padding: '26px 26px 28px',
            marginBottom: 22,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: BRAND.dustyPink,
              margin: '0 0 12px',
            }}
          >
            About me
          </p>
          <p style={{ fontWeight: 300, fontSize: '1rem', lineHeight: 1.75, margin: 0 }}>
            ✨ Mahola | Creadora de contenido. Me apasiona ser yo misma y compartir todo lo
            que me inspira. Me encanta conectar con mi comunidad, que interactúa con todo lo
            que publico, y colaborar con marcas que comparten la energía y los valores que
            quiero transmitir, creando experiencias genuinas para mi audiencia. 💕
            that inspires me. I love connecting with my active community, who engage and
            interact with everything I post. I enjoy collaborating with brands that share the
            same energy and values I want to convey, creating genuine and meaningful
            experiences for my audience. 💕
          </p>
        </div>

        {/* RATES CARD */}
        <div
          style={{
            textAlign: 'left',
            background: BRAND.offWhite,
            borderRadius: 22,
            padding: '26px 26px 10px',
            marginBottom: 22,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: BRAND.dustyPink,
              margin: '0 0 6px',
            }}
          >
            Rates card
          </p>
          {RATES.map((r, i) => (
            <div
              key={r.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: i < RATES.length - 1 ? `1px solid ${BRAND.blush}` : 'none',
              }}
            >
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontWeight: 400, color: BRAND.dustyPink }}>{r.price}</span>
            </div>
          ))}
        </div>

        {/* COLLABORATE */}
        <div
          style={{
            background: `linear-gradient(150deg, ${BRAND.blush}, ${BRAND.softPink})`,
            borderRadius: 22,
            padding: '30px 26px',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '1.3rem', margin: '0 0 8px' }}>
            Collaborate with me!
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 20px' }}>
            Send me any additional project details through the contact form. I&apos;m excited to
            work with you!
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              display: 'inline-block',
              fontWeight: 600,
              color: BRAND.white,
              textDecoration: 'none',
              background: BRAND.brick,
              borderRadius: 999,
              padding: '14px 34px',
            }}
          >
            Work with me
          </a>
        </div>

        {/* volver */}
        <p style={{ marginTop: 34, fontSize: 13 }}>
          <a href="/" style={{ color: BRAND.dustyPink, textDecoration: 'none', fontWeight: 600 }}>
            ← maholas.com
          </a>
        </p>
      </div>
    </main>
  );
}
