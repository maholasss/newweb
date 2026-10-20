'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Hoja que sube desde abajo, como en iOS: se cierra con el botón, tocando fuera,
// con Escape o arrastrándola hacia abajo desde la cabecera.
export default function Sheet({ label, onClose, head, children, className = '' }) {
  const [closing, setClosing] = useState('');
  const sheet = useRef(null);
  const drag = useRef(null);

  const close = useCallback(() => {
    setClosing('anim');
    setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('sheet-open');
    sheet.current?.focus({ preventScroll: true });
    return () => root.classList.remove('sheet-open');
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const down = (e) => {
    if (e.target.closest('button, input, a, textarea')) return;
    drag.current = { y: e.clientY, dy: 0, t: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
    sheet.current.style.transition = 'none';
  };
  const move = (e) => {
    if (!drag.current) return;
    const raw = e.clientY - drag.current.y;
    drag.current.dy = raw > 0 ? raw : raw / 6; // hacia arriba resiste, como en iOS
    sheet.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const up = () => {
    if (!drag.current) return;
    const { dy, t } = drag.current;
    drag.current = null;
    const fast = dy > 40 && dy / (performance.now() - t) > 0.6;
    sheet.current.style.transition = '';
    if (dy > 120 || fast) {
      sheet.current.style.transform = 'translateY(110%)';
      setClosing('drag');
      setTimeout(onClose, 260);
    } else sheet.current.style.transform = '';
  };

  return (
    <div className={`sheet-wrap ${closing ? `closing ${closing}` : ''}`} onClick={close}>
      <div ref={sheet} className={`sheet ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <i className="grabber" aria-hidden="true" />
          <div className="sheet-head-row">{head(close)}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
