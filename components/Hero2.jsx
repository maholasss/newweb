'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   HERO 2 — Mahola (productos UGC cayendo)  v2
   ------------------------------------------------------------
   Entrada: velo blanco semitransparente con un CÍRCULO que se
   va ABRIENDO (iris) mientras el vídeo ya corre detrás.
   Anillo "Cargando contenido" que se rellena y se disuelve.
   El viaje automático del botón del HERO 1 lo recorre entero.
   ============================================================ */

const FRAME_COUNT = 127;
const SCROLL_LENGTH_VH = 260;
const IRIS_END = 0.26; // progreso al que el círculo está abierto del todo
const framePath = (i) => `/hero2-frames/frame_${String(i).padStart(4, '0')}.webp`;

const BRAND = {
  white: '#FFFFFF',
  offWhite: '#FDF8F7',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

export default function Hero2() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const imagesRef = useRef([]);
  const framesOkRef = useRef(false);
  const progressRef = useRef(0);
  const rafRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  const [framesOk, setFramesOk] = useState(null);

  /* ---------- carga de frames ---------- */
  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      framesOkRef.current = true;
      setFramesOk(true);
      let i = 1;
      const batch = () => {
        if (cancelled) return;
        const end = Math.min(i + 20, FRAME_COUNT + 1);
        for (; i < end; i++) {
          const img = new Image();
          img.src = framePath(i);
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

  /* ---------- dibujo ---------- */
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;

    ctx.fillStyle = BRAND.white;
    ctx.fillRect(0, 0, w, h);

    const p = progressRef.current;

    if (framesOkRef.current) {
      const idx = Math.max(1, Math.min(FRAME_COUNT, Math.round(1 + p * (FRAME_COUNT - 1))));
      let img = imagesRef.current[idx];
      let j = idx;
      while ((!img || !img.complete || !img.naturalWidth) && j > 1) {
        j -= 1;
        img = imagesRef.current[j];
      }
      if (img && img.complete && img.naturalWidth) {
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
    } else if (framesOk === false) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, BRAND.white);
      g.addColorStop(1, BRAND.blush);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
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
      setVp({ w: window.innerWidth, h: window.innerHeight });
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

  /* ---------- iris de apertura ---------- */
  const p = progress;
  const irisP = Math.min(1, p / IRIS_END); // 0→1 mientras se abre
  const easeOut = 1 - Math.pow(1 - irisP, 2.2);
  const maxR = Math.hypot(vp.w, vp.h) * 0.62;
  const holeR = 78 + easeOut * maxR; // radio del agujero circular
  const veil = irisP >= 1 ? 0 : 0.78 + (1 - Math.min(1, irisP * 4)) * 0.22; // arranca blanco sólido y se vuelve semitransparente
  const hudOpacity = Math.max(0, 1 - irisP * 1.6); // anillo y texto se disuelven

  const R = 44;
  const CIRC = 2 * Math.PI * R;
  const ringProgress = Math.min(1, irisP * 1.25);

  return (
    <section
      id="hero2"
      ref={wrapRef}
      style={{ height: `${SCROLL_LENGTH_VH}vh`, position: 'relative', background: BRAND.white, marginTop: -2 }}
      aria-label="Productos UGC de Mahola"
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: BRAND.white }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />

        {/* FUNDIDO final: el último tramo se disuelve al blanco de la web */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: BRAND.white,
            opacity: p < 0.86 ? 0 : Math.min(1, (p - 0.86) / 0.12),
            pointerEvents: 'none',
          }}
        />

        {/* VELO con agujero circular que se abre (iris) — el vídeo corre detrás */}
        {veil > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0) ${holeR}px, rgba(255,255,255,${veil}) ${holeR + 2}px)`,
            }}
          />
        )}

        {/* anillo de carga + texto, se disuelven al abrirse */}
        {hudOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              opacity: hudOpacity,
              pointerEvents: 'none',
            }}
          >
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ display: 'block' }}>
              <circle
                cx="55"
                cy="55"
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="5"
              />
              <circle
                cx="55"
                cy="55"
                r={R}
                fill="none"
                stroke={BRAND.dustyPink}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - ringProgress)}
                transform="rotate(-90 55 55)"
              />
            </svg>
            <p
              style={{
                margin: 0,
                color: BRAND.dustyPink,
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Cargando contenido
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
