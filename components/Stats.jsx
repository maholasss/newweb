'use client';

/* ============================================================
   STATS — Instagram en cifras (estilo glass, Guía de marca)
   Datos actualizables en los arrays de abajo.
   Incluye el footer final con crédito.
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

const SUMMARY = [
  { label: 'Followers', value: '19.7k', note: '+0.6% últimos 30 días' },
  { label: 'Engagement', value: '5.9%', note: 'Top 50% de creadoras' },
  { label: 'Follower Engagement', value: '1.94%' },
  { label: 'Posts totales', value: '196' },
  { label: 'Impresiones', value: '120.2k', note: 'últimos 30 días' },
  { label: 'Interacciones', value: '6.9k', note: 'últimos 30 días' },
  { label: 'Alcance 30 días', value: '83.9k' },
  { label: 'Likes de media', value: '344', note: 'por post' },
  { label: 'Comentarios de media', value: '10', note: 'por post' },
];

const REELS = [
  { label: 'Views por reel', value: '7.0k' },
  { label: 'Retención media', value: '7.6s', note: 'por espectador' },
  { label: 'Horas vistas', value: '278h', note: 'últimos 30 días' },
  { label: 'Views por story', value: '118.6' },
];

const AGES = [
  { range: '13-17', pct: 6.3 },
  { range: '18-24', pct: 38.8 },
  { range: '25-34', pct: 31.7 },
  { range: '35-44', pct: 13.7 },
  { range: '45-54', pct: 5.8 },
];

const GENDER = { female: 58.1, male: 41.9 };

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 20,
  boxShadow: '0 6px 24px rgba(61,36,34,0.06)',
};

function StatCard({ label, value, note }) {
  return (
    <div style={{ ...glass, padding: '22px 22px 20px' }}>
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: BRAND.dustyPink,
          margin: '0 0 8px',
        }}
      >
        {label}
      </p>
      <p style={{ fontWeight: 700, fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', margin: 0, color: BRAND.wine }}>
        {value}
      </p>
      {note && (
        <p style={{ fontSize: 12, margin: '6px 0 0', color: BRAND.wine, opacity: 0.6 }}>{note}</p>
      )}
    </div>
  );
}

/* Donut de género en SVG */
function GenderDonut() {
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const femLen = (GENDER.female / 100) * CIRC;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={R} fill="none" stroke={BRAND.blush} strokeWidth="24" />
        <circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke={BRAND.dustyPink}
          strokeWidth="24"
          strokeDasharray={`${femLen} ${CIRC - femLen}`}
          transform="rotate(-90 75 75)"
        />
      </svg>
      <div style={{ fontSize: 15 }}>
        <p style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: BRAND.dustyPink, display: 'inline-block' }} />
          <span style={{ fontWeight: 600 }}>Mujeres</span> {GENDER.female}%
        </p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: BRAND.blush, display: 'inline-block' }} />
          <span style={{ fontWeight: 600 }}>Hombres</span> {GENDER.male}%
        </p>
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <>
      <section
        id="stats"
        style={{
          background: `linear-gradient(180deg, ${BRAND.white} 0%, ${BRAND.offWhite} 18%, ${BRAND.blush} 100%)`,
          padding: 'clamp(70px, 12vh, 130px) 6vw clamp(80px, 12vh, 130px)',
          color: BRAND.wine,
        }}
      >
        <div style={{ maxWidth: 1150, margin: '0 auto' }}>
          {/* cabecera */}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: BRAND.dustyPink,
              margin: '0 0 12px',
            }}
          >
            @maholasss · Instagram
          </p>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', margin: '0 0 14px' }}>
            La comunidad, en cifras
          </h2>
          <p style={{ fontWeight: 300, fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: 560, margin: '0 0 40px', lineHeight: 1.65 }}>
            Un engagement del <strong style={{ fontWeight: 600, color: BRAND.brick }}>5.9%</strong>,
            por encima del 50% de creadoras con alcance similar. Datos actualizados el 14 de julio de 2026.
          </p>

          {/* summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 18,
              marginBottom: 46,
            }}
          >
            {SUMMARY.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* reels + stories */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: BRAND.dustyPink,
              margin: '0 0 16px',
            }}
          >
            Reels & Stories
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 18,
              marginBottom: 46,
            }}
          >
            {REELS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* demografía */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: BRAND.dustyPink,
              margin: '0 0 16px',
            }}
          >
            Audiencia
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 18,
            }}
          >
            <div style={{ ...glass, padding: 26 }}>
              <p style={{ fontWeight: 600, margin: '0 0 18px' }}>Género</p>
              <GenderDonut />
            </div>
            <div style={{ ...glass, padding: 26 }}>
              <p style={{ fontWeight: 600, margin: '0 0 18px' }}>Edad</p>
              {AGES.map((a) => (
                <div key={a.range} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{a.range}</span>
                    <span style={{ opacity: 0.75 }}>{a.pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.8)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(a.pct / 40) * 100}%`,
                        maxWidth: '100%',
                        borderRadius: 99,
                        background: `linear-gradient(90deg, ${BRAND.softPink}, ${BRAND.dustyPink})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: BRAND.white,
          borderTop: `1px solid ${BRAND.blush}`,
          padding: '30px 6vw',
          color: BRAND.wine,
        }}
      >
        <div
          style={{
            maxWidth: 1150,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13.5,
          }}
        >
          <span style={{ fontWeight: 600 }}>Mahola · @maholasss</span>
          <span>
            <a
              href="https://www.instagram.com/maholasss"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: BRAND.wine, marginRight: 18 }}
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@maholasss"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: BRAND.wine, marginRight: 18 }}
            >
              TikTok
            </a>
            <a href="/links" style={{ color: BRAND.wine }}>
              Links
            </a>
          </span>
          <span style={{ opacity: 0.85 }}>
            Web creada por{' '}
            <a
              href="https://www.gorkadicapitan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: BRAND.brick,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Gorka Di Capitan
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
