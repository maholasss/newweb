'use client';
import { useEffect } from 'react';

// En pantallas táctiles, tocar una tarjeta de atrás la trae al frente
export default function HeroCards() {
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) return;
    const wrap = document.querySelector('.phones');
    if (!wrap) return;
    const onTap = (e) => {
      const card = e.target.closest('.phone');
      if (!card || e.target.closest('button')) return;
      wrap.querySelectorAll('.phone').forEach((p) => p.classList.toggle('is-front', p === card));
    };
    wrap.addEventListener('click', onTap);
    return () => wrap.removeEventListener('click', onTap);
  }, []);
  return null;
}
