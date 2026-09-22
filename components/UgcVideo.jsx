'use client';
import { useEffect, useRef, useState } from 'react';

// Vídeo vertical: carga y se reproduce solo mientras está en pantalla, en silencio.
// Botón para activar el sonido.
export default function UgcVideo({ src, label, eager = false, soundLabel = 'Sound' }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = `${src}.mp4`;
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  const toggle = () => {
    const v = ref.current;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };
  return (
    <div className="ugc">
      <video
        ref={ref}
        poster={`${src}.webp`}
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'none'}
        aria-label={label}
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
