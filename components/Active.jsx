'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// En móvil no hay ratón: lo que en escritorio pasa al pasar por encima,
// aquí pasa cuando el bloque queda en el centro de la pantalla.
export default function Active() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) return;
    const els = document.querySelectorAll('.zz-row, .what-card, .step, .tile');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('active', e.isIntersecting)),
      { rootMargin: '-38% 0px -38% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
