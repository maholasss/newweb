'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Añade .in a cada .reveal cuando entra en pantalla
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
