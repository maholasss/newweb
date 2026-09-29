'use client';
import { useEffect, useRef } from 'react';

/* Un solo bucle para toda la página: cada bloque calcula su valor según el
   scroll y lo persigue suavizado. Así el movimiento va fluido también en el
   móvil, donde los eventos de scroll llegan a saltos. */
const items = new Set();
let running = false;

function frame() {
  items.forEach((it) => {
    const r = it.el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
    it.target = it.measure(r, vh);
    const d = it.target - it.current;
    it.current += Math.abs(d) < 0.01 ? d : d * it.ease;
    it.apply(it.current);
  });
  if (items.size) requestAnimationFrame(frame);
  else running = false;
}

function follow(el, measure, apply, ease = 0.12) {
  const it = { el, measure, apply, ease, current: 0, target: 0 };
  it.current = it.target = measure(el.getBoundingClientRect(), window.innerHeight);
  apply(it.current);
  items.add(it);
  if (!running) { running = true; requestAnimationFrame(frame); }
  return () => items.delete(it);
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// La fila de fotos cruza de lado a lado mientras bajas
export function Rail({ photos, children }) {
  const wrap = useRef(null);
  const rail = useRef(null);
  useEffect(() => {
    const w = wrap.current, t = rail.current;
    if (!w || !t || reduced()) return;
    return follow(
      w,
      (r) => {
        const total = r.height - window.innerHeight;
        if (total <= 0) return 0;
        const p = Math.min(1, Math.max(0, -r.top / total));
        return -p * Math.max(0, t.scrollWidth - window.innerWidth + 24);
      },
      (v) => { t.style.transform = `translate3d(${v.toFixed(1)}px,0,0)`; },
      0.13
    );
  }, []);
  return (
    <section className="rail" ref={wrap}>
      <div className="rail-stick">
        {children}
        <div className="rail-track" ref={rail}>
          {photos.map((n, i) => (
            <img className="rail-pic" key={n} style={{ '--i': i }} src={`/fotos/${n}.avif`} alt="Mahola" loading={i > 1 ? 'lazy' : 'eager'} />
          ))}
        </div>
      </div>
    </section>
  );
}

// La foto se queda quieta y los textos pasan por delante
export function Pinned({ photo, blocks, start = 1 }) {
  const wrap = useRef(null);
  useEffect(() => {
    const w = wrap.current;
    if (!w) return;
    const els = [...w.querySelectorAll('.pin-item')];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting)),
      { rootMargin: '-30% 0px -30% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <section className="pin" ref={wrap}>
      <div className="pin-media">
        <img src={`/fotos/${photo}.avif`} alt="Mahola" loading="lazy" />
      </div>
      <div className="pin-list">
        {blocks.map(([h, p], i) => (
          <div className="pin-item" key={h}>
            <span className="story-n">{String(start + i).padStart(2, '0')}</span>
            <h2>{h}</h2>
            <Words text={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Texto que aparece palabra a palabra
export function Words({ text, as: Tag = 'p', className = '' }) {
  return (
    <Tag className={`words ${className}`}>
      {text.split(' ').map((w, i) => (
        <span key={i} style={{ '--w': i }}>{w}&nbsp;</span>
      ))}
    </Tag>
  );
}

// Bloque a pantalla completa: la foto se mueve más despacio que el texto
export function Full({ photo, kicker, title, text, dark = false, first = false }) {
  const wrap = useRef(null);
  const img = useRef(null);
  const txt = useRef(null);
  useEffect(() => {
    const w = wrap.current, i = img.current, x = txt.current;
    if (!w || !i || reduced()) return;
    return follow(
      w,
      (r, vh) => (r.top + r.height / 2 - vh / 2) / vh,
      (p) => {
        i.style.transform = `translate3d(0, ${(-p * 3.5).toFixed(2)}%, 0) scale(1.04)`;
        if (x) x.style.transform = `translate3d(0, ${(p * 24).toFixed(1)}px, 0)`;
      },
      0.15
    );
  }, []);
  return (
    <section className={`full${dark ? ' full--dark' : ''}`} ref={wrap}>
      <div className="full-media">
        <img ref={img} src={`/fotos/${photo}.avif`} alt="Mahola" loading={first ? 'eager' : 'lazy'} />
      </div>
      <div className="full-text reveal" ref={txt}>
        {kicker && <p className="eyebrow">{kicker}</p>}
        {first ? <h1>{title}</h1> : <h2>{title}</h2>}
        {text && <Words text={text} />}
      </div>
    </section>
  );
}

// Cierre: LA MISMA foto del bloque fijo (el div .pin-media) es la que crece
// hasta ser el fondo de la página y se difumina mientras entra el botón.
// No hay segunda foto: cuando el bloque fijo se acaba, la foto pasa a fija en
// pantalla en su misma posición, y desde ahí se agranda al ritmo del scroll.
export function Finale({ kicker, title, text, cta, href }) {
  const wrap = useRef(null);
  useEffect(() => {
    const w = wrap.current;
    const pin = document.querySelector('.pin');
    const img = document.querySelector('.pin-media');
    if (!w || !pin || !img) return;
    if (reduced()) { w.style.setProperty('--p', '1'); return; }
    let x0 = 0, y0 = 100, w0 = 0, h0 = 0;
    const measure = () => {
      const r = img.getBoundingClientRect();
      x0 = r.left; w0 = r.width; h0 = r.height;
      y0 = parseFloat(getComputedStyle(img).top) || 100;
    };
    if (img.style.position !== 'fixed') measure();
    window.addEventListener('resize', measure);
    const lerp = (a, b, k) => a + (b - a) * k;
    const stop = follow(
      w,
      (r, vh) => {
        const total = r.height - vh;
        return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      },
      (p) => {
        const vh = window.innerHeight, vw = window.innerWidth;
        const pr = pin.getBoundingClientRect();
        const fr = w.getBoundingClientRect();
        // la foto se suelta del bloque en cuanto éste ya no puede sujetarla
        const free = pr.bottom <= y0 + h0 + 1;
        if (!free) {
          if (img.style.position === 'fixed') img.style.cssText = '';
          w.style.setProperty('--p', '0');
          return;
        }
        w.style.setProperty('--p', p.toFixed(3));
        const k = Math.min(1, p * 2);           // 0 = tamaño original, 1 = pantalla completa
        const fade = Math.max(0, p * 2 - 1);    // segunda mitad: desenfoque y velo
        const past = Math.min(0, fr.bottom - vh); // al acabar el cierre, se va con la página
        img.style.cssText = `position:fixed;z-index:0;margin:0;left:${lerp(x0, 0, k)}px;top:${lerp(y0, 0, k) + past}px;width:${lerp(w0, vw, k)}px;height:${lerp(h0, vh, k)}px;border-radius:${26 * (1 - k)}px;filter:blur(${14 * fade}px);--veil:${(0.55 * fade).toFixed(3)}`;
      },
      0.14
    );
    return () => { stop(); window.removeEventListener('resize', measure); img.style.cssText = ''; };
  }, []);
  return (
    <section className="finale" ref={wrap}>
      <div className="finale-stick">
        <div className="finale-text">
          {kicker && <p className="eyebrow">{kicker}</p>}
          <h2>{title}</h2>
          <p>{text}</p>
          <a href={href} className="btn btn--dark finale-btn"><span>{cta}</span></a>
        </div>
      </div>
    </section>
  );
}
