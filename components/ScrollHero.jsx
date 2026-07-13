'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   HERO 1 — Mahola (scrubbing de frames ligado al scroll)
   ------------------------------------------------------------
   FRAMES: exporta desde DaVinci PNG -> convierte a WebP y copia
   los archivos a  /public/hero-frames/frame_0001.webp ...
   Ajusta FRAME_COUNT al número real de frames y listo.
   Mientras no existan frames, se dibuja un placeholder de marca.
   ============================================================ */

const FRAME_COUNT = 240; // <-- CAMBIA esto al nº real de frames
const SCROLL_LENGTH_VH = 320; // recorrido total del hero en vh
const framePath = (i) => `/hero-frames/frame_${String(i).padStart(4, '0')}.webp`;

// Colores de marca (Guía Blush & Ladrillo)
const BRAND = {
  white: '#FFFFFF',
  offWhite: '#FDF8F7',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

// Opacidad 0→1→0 entre tramos de progreso
function fadeInOut(p, inStart, inEnd, outStart = 2, outEnd = 3) {
  if (p <= inStart) return 0;
  if (p < inEnd) return (p - inStart) / (inEnd - inStart);
  if (p <= outStart) return 1;
  if (p < outEnd) return 1 - (p - outStart) / (outEnd - outStart);
  return 0;
}

export default function ScrollHero() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const imagesRef = useRef([]);
  const framesOkRef = useRef(false);
  const currentFrameRef = useRef(1);
  const progressRef = useRef(0);
  const rafRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [framesOk, setFramesOk] = useState(null); // null = comprobando

  /* ---------- carga de frames ---------- */
  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      framesOkRef.current = true;
      setFramesOk(true);
      // precarga progresiva en tandas para no saturar
      let i = 1;
      const batch = () => {
        if (cancelled) return;
        const end = Math.min(i + 20, FRAME_COUNT + 1);
        for (; i < end; i++) {
          const img = new Image();
          img.src = framePath(i);
          img.onload = () => {
            if (!cancelled) setLoaded((n) => n + 1);
          };
          imagesRef.current[i] = img;
        }
        if (i <= FRAME_COUNT) setTimeout(batch, 60);
      };
      batch();
    };
    probe.onerror = () => {
      if (cancelled) return;
      framesOkRef.current = false;
      setFramesOk(false);
    };
    probe.src = framePath(1);
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- dibujo en canvas ---------- */
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;

    if (framesOkRef.current) {
      const idx = Math.max(
        1,
        Math.min(FRAME_COUNT, Math.round(1 + progressRef.current * (FRAME_COUNT - 1)))
      );
      // usa el frame pedido o el último cargado anterior
      let img = imagesRef.current[idx];
      let j = idx;
      while ((!img || !img.complete || !img.naturalWidth) && j > 1) {
        j -= 1;
        img = imagesRef.current[j];
      }
      if (img && img.complete && img.naturalWidth) {
        // object-fit: cover
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        currentFrameRef.current = idx;
        return;
      }
    }

    // ---- placeholder de marca (sin frames todavía) ----
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, BRAND.offWhite);
    g.addColorStop(0.55, BRAND.blush);
    g.addColorStop(1, BRAND.softPink);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // círculo suave que "respira" con el scroll (simula el vídeo)
    const p = progressRef.current;
    const r = Math.min(w, h) * (0.18 + p * 0.22);
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.52, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    ctx.fillStyle = BRAND.wine;
    ctx.globalAlpha = 0.45;
    ctx.font = `500 ${Math.max(12, Math.round(w / 90))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Tus frames irán aquí →  /public/hero-frames/frame_0001.webp', w / 2, h - 28);
    ctx.globalAlpha = 1;
  };

  /* ---------- scroll + resize ---------- */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      draw();
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const total = wrap.offsetHeight - window.innerHeight;
        const y = -wrap.getBoundingClientRect().top;
        const p = Math.max(0, Math.min(1, total > 0 ? y / total : 0));
        progressRef.current = reduced ? 1 : p;
        setProgress(progressRef.current);
        draw();
      });
    };

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framesOk]);

  /* ---------- coreografía de textos ---------- */
  const p = progress;
  const t1 = fadeInOut(p, 0.04, 0.16, 0.62, 0.74); // HOLA, soy Mahola (izquierda)
  const t2 = fadeInOut(p, 0.14, 0.26, 0.62, 0.74); // soy creadora UGC (derecha)
  const t3 = fadeInOut(p, 0.3, 0.42, 0.62, 0.74); // y bailarina profesional
  const cta = fadeInOut(p, 0.78, 0.9); // botón final

  const fall = (op, dist = 46) => ({
    opacity: op,
    transform: `translateY(${(1 - op) * -dist}px)`,
  });

  const scrollToWork = () => {
    document.getElementById('trabajo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={wrapRef}
      style={{ height: `${SCROLL_LENGTH_VH}vh`, position: 'relative' }}
      aria-label="Presentación de Mahola"
    >
      {/* h1 real oculto para SEO */}
      <h1 className="sr-only">Mahola — creadora UGC y bailarina profesional</h1>

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />

        {/* velo blanco muy sutil para que el texto vino respire (regla 90/8/2) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.42) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* texto izquierda */}
        <div
          style={{
            position: 'absolute',
            left: 'clamp(20px, 7vw, 110px)',
            top: '38%',
            maxWidth: '38vw',
            color: BRAND.wine,
            pointerEvents: 'none',
            ...fall(t1),
          }}
        >
          <p
            style={{
              fontWeight: 300,
              fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Hola,
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 6vw, 5rem)',
              lineHeight: 1.02,
              margin: '0.2em 0 0',
            }}
          >
            soy Mahola
          </p>
        </div>

        {/* texto derecha */}
        <div
          style={{
            position: 'absolute',
            right: 'clamp(20px, 7vw, 110px)',
            top: '52%',
            maxWidth: '38vw',
            textAlign: 'right',
            color: BRAND.wine,
            pointerEvents: 'none',
            ...fall(t2),
          }}
        >
          <p
            style={{
              fontWeight: 600,
              fontSize: 'clamp(1.3rem, 3vw, 2.4rem)',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            soy creadora <span style={{ color: BRAND.brick }}>UGC</span>
          </p>
        </div>

        {/* subtítulo pequeño */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '16%',
            transform: 'translateX(-50%)',
            color: BRAND.wine,
            pointerEvents: 'none',
            textAlign: 'center',
            ...fall(t3, 26),
            transform: `translateX(-50%) translateY(${(1 - t3) * -26}px)`,
          }}
        >
          <p
            style={{
              fontWeight: 300,
              fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
              letterSpacing: '0.14em',
              margin: 0,
            }}
          >
            y bailarina profesional
          </p>
        </div>

        {/* CTA final del hero */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
            opacity: cta,
            pointerEvents: cta > 0.5 ? 'auto' : 'none',
            transition: 'opacity 0.2s',
          }}
        >
          <button
            onClick={scrollToWork}
            style={{
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              color: BRAND.white,
              background: BRAND.brick,
              border: 'none',
              borderRadius: 999,
              padding: '16px 36px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(184,87,76,0.35)',
            }}
          >
            VER MI TRABAJO
          </button>
        </div>

        {/* pista de scroll al inicio */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            color: BRAND.wine,
            opacity: Math.max(0, 0.7 - p * 6),
            fontSize: 12,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          scroll ↓
        </div>

        {/* indicador de carga de frames */}
        {framesOk && loaded < FRAME_COUNT && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontSize: 11,
              color: BRAND.wine,
              opacity: 0.5,
            }}
          >
            cargando {Math.round((loaded / FRAME_COUNT) * 100)}%
          </div>
        )}
      </div>
    </section>
  );
}
