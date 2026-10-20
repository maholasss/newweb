'use client';

import { useEffect, useRef } from 'react';

// Número que sube contando desde cero al aparecer (y salta directo si se prefiere sin animaciones).
export default function CountUp({ value, duration = 900 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || value <= 1) {
      el.textContent = String(value);
      return;
    }
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={ref}>{value}</span>;
}
