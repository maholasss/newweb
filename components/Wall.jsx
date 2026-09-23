'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BRANDS, CATS, videos } from '@/lib/brands';
import { T, brandPath } from '@/lib/site';

// Tonos de su paleta para los círculos
const TINTS = ['var(--blush)', 'var(--paper)', 'var(--rose)', '#f7e7e2', '#eddcd6', '#f3d9d3'];

// Pared de marcas: círculos con el logo; al pinchar se abren los vídeos con sonido.
export default function Wall({ lang, marks }) {
  const t = T[lang];
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null); // { i: índice de marca en la lista filtrada, v: índice de vídeo }
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
          <Tile key={b.slug} b={b} lang={lang} i={i} mark={marks[b.slug]} onOpen={() => setOpen({ i, v: 0 })} />
        ))}
      </div>
      {open && <Lightbox list={list} open={open} setOpen={setOpen} lang={lang} />}
    </>
  );
}

function Tile({ b, lang, mark, onOpen, i }) {
  return (
    <button
      type="button"
      className="tile"
      style={{ '--i': i, '--tint': TINTS[i % TINTS.length] }}
      onClick={onOpen}
      aria-label={`${b.name}: ${b[lang].t}`}
    >
      <span className="tile-disc">{mark}</span>
      <span className="tile-name">{b.name}</span>
      <span className="tile-cat">{CATS[b.cat][lang]} · {b.d.length} {b.d.length > 1 ? T[lang].videos : T[lang].video}</span>
    </button>
  );
}

function Lightbox({ list, open, setOpen, lang }) {
  const t = T[lang];
  const b = list[open.i];
  const vids = videos(b);
  const close = useCallback(() => setOpen(null), [setOpen]);
  const go = useCallback(
    (dir) => {
      // primero recorre los vídeos de la marca, luego salta de marca
      const v = open.v + dir;
      if (v >= 0 && v < vids.length) return setOpen({ i: open.i, v });
      const i = (open.i + dir + list.length) % list.length;
      setOpen({ i, v: dir > 0 ? 0 : list[i].d.length - 1 });
    },
    [open, vids.length, list, setOpen]
  );
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [close, go]);
  const src = vids[open.v];
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={b.name} onClick={(e) => e.target === e.currentTarget && close()}>
      <button type="button" className="lb-close" onClick={close}>{t.close} ✕</button>
      <div className="lb-inner">
        <div className="lb-video">
          <video key={src} poster={`${src}.webp`} autoPlay playsInline controls loop>
            <source src={`${src}.webm`} type="video/webm; codecs=av01.0.05M.08" />
            <source src={`${src}.mp4`} type="video/mp4" />
          </video>
        </div>
        <div className="lb-bar">
          <button type="button" onClick={() => go(-1)} aria-label={t.prev}>←</button>
          <b>{b.name}</b>
          {vids.length > 1 && (
            <span className="lb-dots">{vids.map((_, i) => <i key={i} className={i === open.v ? 'on' : ''} />)}</span>
          )}
          <button type="button" onClick={() => go(1)} aria-label={t.next}>→</button>
        </div>
        {b.page && <Link href={brandPath(b.slug, lang)} className="link-arrow" style={{ color: '#fff' }}>{t.zzLink} →</Link>}
      </div>
    </div>
  );
}
