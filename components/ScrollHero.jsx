'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   HERO 1 — Mahola  v3
   ------------------------------------------------------------
   - Flecha superior: viaje automático hasta que cae el texto
   - Puerta: el vídeo reposa mientras se lee el texto
   - Botón redondo bajo "Bailarina Profesional": lanza el viaje
     automático (Mahola se va andando + HERO 2 entero + carga)
   ============================================================ */

const FRAME_COUNT = 365;
const SCROLL_LENGTH_VH = 320;
const AUTO_SPEED = 420; // px/seg de los viajes automáticos
const framePath = (i) => `/hero-frames/frame_${String(i).padStart(4, '0')}.webp`;

const BRAND = {
  white: '#FFFFFF',
  offWhite: '#FDF8F7',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

/* Momentos de la coreografía (progreso 0→1 del hero) */
const TIMING = {
  t1In: [0.2, 0.32], // Hola / Soy Mahola
  t2In: [0.32, 0.44], // Creadora de contenido
  t3In: [0.44, 0.54], // Bailarina Profesional
  allOut: [0.72, 0.84],
  buttonIn: 0.55, // aparece el botón redondo
  autoTarget: 0.58, // hasta dónde viaja la flecha 1
};

function fadeInOut(p, [inS, inE], [outS, outE]) {
  if (p <= inS) return 0;
  if (p < inE) return (p - inS) / (inE - inS);
  if (p <= outS) return 1;
  if (p < outE) return 1 - (p - outS) / (outE - outS);
  return 0;
}

function Arrow({ color, size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'block', animation: 'mh-bounce 1.6s ease-in-out infinite' }}
    >
      <path
        d="M4 8l8 8 8-8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ScrollHero() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const imagesRef = useRef([]);
  const framesOkRef = useRef(false);
  const progressRef = useRef(0);
  const rafRef = useRef(0);
  const autoRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
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

  /* ---------- dibujo ---------- */
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;

    ctx.fillStyle = BRAND.white;
    ctx.fillRect(0, 0, w, h);

    if (framesOkRef.current) {
      const idx = Math.max(
        1,
        Math.min(FRAME_COUNT, Math.round(1 + progressRef.current * (FRAME_COUNT - 1)))
      );
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
        return;
      }
    }

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, BRAND.offWhite);
    g.addColorStop(0.55, BRAND.blush);
    g.addColorStop(1, BRAND.softPink);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

  /* ---------- viajes automáticos ---------- */
  const cancelAuto = () => cancelAnimationFrame(autoRef.current);

  const animateScrollTo = (targetAbs) => {
    const startAbs = window.scrollY;
    const dist = targetAbs - startAbs;
    if (dist <= 0) return;
    const dur = (dist / AUTO_SPEED) * 1000;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    cancelAuto();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo({ top: startAbs + dist * ease(t), behavior: 'instant' });
      if (t < 1) autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
  };

  const autoScrollToProgress = (targetP) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const total = wrap.offsetHeight - window.innerHeight;
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
    animateScrollTo(wrapTop + targetP * total);
  };

  /* Botón redondo: recorre el final del HERO 1 + HERO 2 entero + carga */
  const startTheShow = () => {
    const dest =
      document.getElementById('trabajo') || document.getElementById('hero2');
    if (dest) {
      animateScrollTo(dest.getBoundingClientRect().top + window.scrollY);
    } else {
      autoScrollToProgress(1);
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

    const stopAuto = () => cancelAuto();

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', stopAuto, { passive: true });
    window.addEventListener('touchstart', stopAuto, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', stopAuto);
      window.removeEventListener('touchstart', stopAuto);
      cancelAnimationFrame(rafRef.current);
      cancelAuto();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framesOk]);

  /* ---------- coreografía ---------- */
  const p = progress;
  const t1 = fadeInOut(p, TIMING.t1In, TIMING.allOut);
  const t2 = fadeInOut(p, TIMING.t2In, TIMING.allOut);
  const t3 = fadeInOut(p, TIMING.t3In, TIMING.allOut);
  const arrow1 = Math.max(0, 1 - p * 20);
  const btn = fadeInOut(p, [TIMING.buttonIn, TIMING.buttonIn + 0.05], TIMING.allOut);

  const fall = (op, dist = 46) => ({
    opacity: op,
    transform: `translateY(${(1 - op) * -dist}px)`,
  });

  return (
    <section
      ref={wrapRef}
      style={{ height: `${SCROLL_LENGTH_VH}vh`, position: 'relative', background: BRAND.white }}
      aria-label="Presentación de Mahola"
    >
      <style>{`
        @keyframes mh-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(9px); }
        }
        @keyframes mh-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184,87,76,0.35); }
          50% { box-shadow: 0 0 0 14px rgba(184,87,76,0); }
        }
      `}</style>

      <h1 className="sr-only">Mahola — creadora de contenido UGC y bailarina profesional</h1>

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: BRAND.white }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.42) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* fundido a blanco al final del HERO 1 (empalme con HERO 2) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: BRAND.white,
            opacity: p < 0.9 ? 0 : Math.min(1, (p - 0.9) / 0.1),
            pointerEvents: 'none',
          }}
        />

        {/* FLECHA 1 — arriba de ella */}
        <button
          onClick={() => autoScrollToProgress(TIMING.autoTarget)}
          aria-label="Comenzar"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '8%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: '50%',
            width: 86,
            height: 86,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: arrow1,
            pointerEvents: arrow1 > 0.3 ? 'auto' : 'none',
            transition: 'opacity 0.25s',
            zIndex: 20,
          }}
        >
          <Arrow color={BRAND.brick} size={40} />
        </button>

        {/* TEXTO IZQUIERDA */}
        <div
          style={{
            position: 'absolute',
            left: 'clamp(20px, 7vw, 110px)',
            top: '36%',
            maxWidth: '40vw',
            color: BRAND.wine,
            pointerEvents: 'none',
            ...fall(t1),
          }}
        >
          <p style={{ fontWeight: 300, fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)', margin: 0 }}>
            Hola
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 6vw, 5rem)',
              lineHeight: 1.02,
              margin: '0.12em 0 0',
            }}
          >
            Soy <span style={{ color: BRAND.dustyPink }}>Mahola</span>
          </p>
        </div>

        {/* TEXTO DERECHA + BOTÓN */}
        <div
          style={{
            position: 'absolute',
            right: 'clamp(20px, 7vw, 110px)',
            top: '44%',
            maxWidth: '40vw',
            textAlign: 'right',
          }}
        >
          <p
            style={{
              fontWeight: 600,
              fontSize: 'clamp(1.4rem, 3.2vw, 2.6rem)',
              lineHeight: 1.15,
              margin: 0,
              color: BRAND.wine,
              pointerEvents: 'none',
              ...fall(t2),
            }}
          >
            <span style={{ color: BRAND.brick }}>Creadora</span> de contenido
          </p>
          <p
            style={{
              fontWeight: 400,
              fontSize: 'clamp(1.05rem, 2vw, 1.6rem)',
              margin: '0.5em 0 0',
              color: BRAND.wine,
              pointerEvents: 'none',
              ...fall(t3, 30),
            }}
          >
            <span style={{ color: BRAND.dustyPink, fontWeight: 600 }}>Bailarina</span>{' '}
            Profesional
          </p>

          {/* BOTÓN REDONDO — lanza Mahola andando + HERO 2 + carga */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 26,
              opacity: btn,
              transform: `translateY(${(1 - btn) * 18}px)`,
              transition: 'opacity 0.2s, transform 0.2s',
              pointerEvents: btn > 0.3 ? 'auto' : 'none',
            }}
          >
            <button
              onClick={startTheShow}
              aria-label="Ver el trabajo de Mahola"
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                border: `2px solid ${BRAND.brick}`,
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                animation: 'mh-pulse 2.2s ease-out infinite',
                zIndex: 20,
              }}
            >
              <Arrow color={BRAND.brick} size={30} />
            </button>
          </div>
        </div>

        {/* pista de scroll inicial */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 22,
            transform: 'translateX(-50%)',
            color: BRAND.wine,
            opacity: Math.max(0, 0.65 - p * 8),
            fontSize: 12,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          scroll ↓
        </div>

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
