'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BRANDS, CATS } from '@/lib/brands';
import { T, brandPath } from '@/lib/site';

// Tonos de su paleta para los círculos
const TINTS = ['var(--blush)', 'var(--paper)', 'var(--rose)', '#f7e7e2', '#eddcd6', '#f3d9d3'];

// Pared de marcas: cada círculo lleva a la página de esa marca
export default function Wall({ lang, marks }) {
  const t = T[lang];
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? BRANDS : BRANDS.filter((b) => b.cat === cat);
  const cats = Object.keys(CATS).filter((c) => BRANDS.some((b) => b.cat === c));

  return (
    <>
      <div className="filters" role="group">
        <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{t.all}</button>
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{CATS[c][lang]}</button>
        ))}
      </div>
      <div className="wall">
        {list.map((b, i) => (
          <Link
            key={b.slug}
            href={brandPath(b.slug, lang)}
            className="tile"
            style={{ '--i': i, '--tint': TINTS[i % TINTS.length] }}
            aria-label={`${b.name}: ${b[lang].t}`}
          >
            <span className="tile-disc">{marks[b.slug]}</span>
            <span className="tile-name">{b.name}</span>
            <span className="tile-cat">{CATS[b.cat][lang]} · {b.d.length} {b.d.length > 1 ? t.videos : t.video}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
