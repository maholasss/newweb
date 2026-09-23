'use client';
import { useEffect, useRef, useState } from 'react';

// Vídeo vertical: carga y se reproduce solo mientras está en pantalla, en silencio.
// La portada va de fondo, así que no hay parpadeo al arrancar.
export default function UgcVideo({ src, label, eager = false, soundLabel = 'Sound' }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // React no refleja `muted` al elemento y sin esto no arranca solo
    const play = () => {
      v.play().catch(() => {
        // aún no hay datos: lo intentamos en cuanto los haya
        v.addEventListener('canplay', () => v.play().catch(() => {}), { once: true });
      });
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.querySelector('source')) {
            // AV1 para quien lo soporte (pesa la mitad), H.264 para el resto
            for (const [ext, type] of [['webm', 'video/webm; codecs=av01.0.05M.08'], ['mp4', 'video/mp4']]) {
              const so = document.createElement('source');
              so.src = `${src}.${ext}`;
              so.type = type;
              v.appendChild(so);
            }
            v.load();
          }
          play();
        } else v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  const toggle = () => {
    const v = ref.current;
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  return (
    <div className="ugc" style={{ backgroundImage: `url(${src}.webp)` }}>
      <video
        ref={ref}
        poster={`${src}.webp`}
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        aria-label={label}
        className={ready ? 'on' : ''}
        onLoadedData={() => setReady(true)}
      />
      <button type="button" className="ugc-sound" onClick={toggle} aria-label={soundLabel} aria-pressed={!muted}>
        {muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        )}
      </button>
    </div>
  );
}
