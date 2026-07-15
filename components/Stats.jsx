'use client';

/* ============================================================
   STATS — Mahola  v2 · iPad mockup con teclado rosa
   Actualiza los números en DATA cada mes y listo.
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

const EXTERNAL_URL = 'https://beacons.ai/maholasss/mediakit';

const DATA = {
  updated: 'Jul 2026',
  summary: [
    { label: 'Seguidores', value: '19.7k', note: '+0.6% últimos 30 días' },
    { label: 'Engagement', value: '5.9%', note: 'Top 50% de creadoras', hot: true },
    { label: 'Impresiones', value: '120.2k', note: 'últimos 30 días' },
    { label: 'Alcance 30 días', value: '83.9k', note: 'cuentas únicas' },
    { label: 'Likes medios', value: '344', note: 'por publicación' },
    { label: 'Comentarios', value: '10', note: 'de media por post' },
  ],
  reels: [
    { label: 'Views por reel', value: '7.0k' },
    { label: 'Retención', value: '7.6s' },
    { label: 'Horas vistas', value: '278h' },
    { label: 'Views por story', value: '118.6' },
  ],
  gender: { female: 58.1, male: 41.9 },
  ages: [
    { label: '13-17', pct: 6.3 },
    { label: '18-24', pct: 38.8 },
    { label: '25-34', pct: 31.7 },
    { label: '35-44', pct: 13.7 },
    { label: '45-54', pct: 5.8 },
  ],
};

const KEY_ROWS = [10, 9, 7, 3]; // teclas por fila del teclado

export default function Stats() {
  return (
    <section
      id="cifras"
      style={{
        background: `linear-gradient(180deg, ${BRAND.offWhite} 0%, ${BRAND.blush} 100%)`,
        padding: 'clamp(70px, 12vh, 130px) 5vw clamp(80px, 12vh, 130px)',
        color: BRAND.wine,
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* cabecera */}
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: BRAND.dustyPink, margin: '0 0 12px', textAlign: 'center' }}>
          @maholasss · Instagram
        </p>
        <h2 style={{ fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', margin: '0 0 14px', textAlign: 'center' }}>
          La comunidad, en cifras
        </h2>
        <p style={{ fontWeight: 300, fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: 560, margin: '0 auto 52px', lineHeight: 1.65, textAlign: 'center' }}>
          Un engagement del <strong style={{ fontWeight: 600, color: BRAND.brick }}>5.9%</strong>, por
          encima del 50% de creadoras con alcance similar. Datos de los últimos 30 días.
        </p>

        {/* ================= iPad ================= */}
        <div
          style={{
            margin: '0 auto',
            maxWidth: 760,
            borderRadius: 34,
            padding: 'clamp(12px, 2vw, 20px)',
            background: `linear-gradient(160deg, ${BRAND.offWhite}, ${BRAND.blush})`,
            border: `1px solid rgba(61,36,34,0.12)`,
            boxShadow: '0 30px 60px -20px rgba(61,36,34,0.28), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* cámara frontal */}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.wine, opacity: 0.35, margin: '0 auto 10px' }} />

          {/* pantalla */}
          <div
            style={{
              borderRadius: 20,
              background: BRAND.white,
              border: `1px solid rgba(61,36,34,0.08)`,
              padding: 'clamp(16px, 2.5vw, 26px)',
              overflow: 'hidden',
            }}
          >
            {/* barra tipo navegador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: BRAND.softPink }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: BRAND.blush }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: BRAND.dustyPink }} />
              <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>
                actualizado · {DATA.updated}
              </span>
            </div>

            {/* resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {DATA.summary.map((s) => (
                <div
                  key={s.label}
                  style={{
                    borderRadius: 14,
                    padding: '14px 14px 12px',
                    background: s.hot ? `linear-gradient(150deg, ${BRAND.brick}, ${BRAND.dustyPink})` : 'rgba(240,218,213,0.35)',
                    color: s.hot ? BRAND.white : BRAND.wine,
                    border: '1px solid rgba(61,36,34,0.06)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75 }}>{s.label}</p>
                  <p style={{ margin: '4px 0 2px', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{s.note}</p>
                </div>
              ))}
            </div>

            {/* reels & stories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginTop: 12 }}>
              {DATA.reels.map((r) => (
                <div key={r.label} style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(253,248,247,0.9)', border: `1px solid ${BRAND.blush}` }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{r.value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.65 }}>{r.label}</p>
                </div>
              ))}
            </div>

            {/* audiencia */}
            <div style={{ marginTop: 18 }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BRAND.dustyPink }}>
                Audiencia · {DATA.gender.female}% mujeres · {DATA.gender.male}% hombres
              </p>
              {DATA.ages.map((a) => (
                <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 44, fontSize: 12, fontWeight: 600 }}>{a.label}</span>
                  <div style={{ flex: 1, height: 10, borderRadius: 6, background: BRAND.offWhite, overflow: 'hidden' }}>
                    <div style={{ width: `${a.pct}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${BRAND.softPink}, ${BRAND.brick})` }} />
                  </div>
                  <span style={{ width: 46, fontSize: 12, textAlign: 'right', opacity: 0.7 }}>{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ============ teclado rosa ============ */}
          <div
            style={{
              marginTop: 14,
              borderRadius: 16,
              padding: '10px 12px 12px',
              background: `linear-gradient(180deg, ${BRAND.softPink}, ${BRAND.dustyPink})`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {KEY_ROWS.map((count, row) => (
              <div key={row} style={{ display: 'flex', gap: 6, marginBottom: row === KEY_ROWS.length - 1 ? 0 : 6 }}>
                {Array.from({ length: count }).map((_, k) => (
                  <span
                    key={k}
                    style={{
                      flex: row === KEY_ROWS.length - 1 && k === 1 ? 6 : 1, // barra espaciadora
                      height: 'clamp(14px, 2.4vw, 22px)',
                      borderRadius: 6,
                      background: 'rgba(253,248,247,0.85)',
                      boxShadow: '0 2px 0 rgba(61,36,34,0.18)',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* CTA — ver más datos */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          
          <a
            href={EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '15px 38px',
              borderRadius: 40,
              background: BRAND.brick,
              color: BRAND.white,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 12px 26px -8px rgba(184,87,76,0.55)',
            }}
          >
            Ver más datos →
          </a>
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.55 }}>
            Datos en tiempo real, sincronizados con Instagram
          </p>
        </div>
      </div>
    </section>
  );
}