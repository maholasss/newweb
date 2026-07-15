const BRAND = {
  white: '#FFFFFF',
  offWhite: '#FDF8F7',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

export default function Outro() {
  return (
    <>
      <section
        style={{
          padding: 'clamp(90px, 16vh, 180px) 6vw',
          textAlign: 'center',
        }}
      >
        <div>
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
            href="mailto:hola@maholas.com" /* <-- CAMBIA por el email real */
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
        </div>
      </section>
      <footer
        style={{
          background: BRAND.wine,
          color: BRAND.offWhite,
          textAlign: 'center',
          padding: '46px 6vw 40px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: 18, letterSpacing: '0.04em' }}>Mahola</p>
        <p style={{ margin: '10px 0 0', fontSize: 14 }}>
          <a href="https://www.instagram.com/maholasss" target="_blank" rel="noopener noreferrer" style={{ color: BRAND.offWhite, textDecoration: 'none', margin: '0 10px' }}>Instagram</a>
          ·
          <a href="https://www.tiktok.com/@maholasss" target="_blank" rel="noopener noreferrer" style={{ color: BRAND.offWhite, textDecoration: 'none', margin: '0 10px' }}>TikTok</a>
          ·
          <a href="/links" style={{ color: BRAND.offWhite, textDecoration: 'none', margin: '0 10px' }}>Links</a>
        </p>
        <p style={{ margin: '22px 0 0', fontSize: 12, opacity: 0.75 }}>
          Web creada por{' '}
          
            href="https://www.gorkadicapitan.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: BRAND.offWhite, textDecoration: 'underline', textDecorationColor: '#B8574C', textUnderlineOffset: 3, fontWeight: 600 }}
          >
            Gorka Di Capitan
          </a>
        </p>
      </footer>
    </>
  );
}
