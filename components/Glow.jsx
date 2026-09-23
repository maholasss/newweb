'use client';
import { useEffect } from 'react';

// El brillo del bloque negro sigue al ratón
export default function Glow() {
  useEffect(() => {
    const el = document.querySelector('.cta');
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  });
  return null;
}
