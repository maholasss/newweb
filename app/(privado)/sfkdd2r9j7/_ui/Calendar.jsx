'use client';

import { useMemo, useRef, useState } from 'react';
import { fmt, fmtLong, isBleed, marksFor } from '../_lib/cycle';
import { Icon } from './icons';

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const pad = (n) => String(n).padStart(2, '0');

function describe(mk) {
  const t = [];
  if (mk.period) t.push('regla');
  if (mk.predicted) t.push('regla prevista');
  if (mk.spot) t.push('manchado');
  if (mk.ovulation) t.push('ovulación');
  else if (mk.fertile) t.push('ventana fértil');
  if (mk.log) t.push('con registro');
  return t.length ? `, ${t.join(', ')}` : '';
}

export default function Calendar({ s, data, today, setDay, openDay, edit, setEdit }) {
  const [ym, setYm] = useState(() => [Number(today.slice(0, 4)), Number(today.slice(5, 7))]);
  const [dir, setDir] = useState('');
  const touch = useRef(null);
  const marks = useMemo(() => marksFor(s, data.days, today), [s, data.days, today]);

  const [y, m] = ym;
  const move = (n) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setDir(n > 0 ? 'next' : 'prev');
    setYm([d.getUTCFullYear(), d.getUTCMonth() + 1]);
  };
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthKey = `${y}-${pad(m)}-01`;
  const isThisMonth = today.slice(0, 7) === monthKey.slice(0, 7);

  const tap = (k) => {
    if (!edit) return openDay(k);
    if (k > today) return;
    setDay(k, { flow: isBleed(data.days[k]) ? null : 'medium' });
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<span key={`b${i}`} />);
  // Cada día entra un pelín después del anterior (en cascada por la diagonal).
  for (let d = 1; d <= count; d++) {
    const k = `${y}-${pad(m)}-${pad(d)}`;
    const mk = marks[k] || {};
    const cls = ['day'];
    if (mk.period) cls.push('period');
    else if (mk.predicted) cls.push('predicted');
    if (!mk.period && mk.fertile) cls.push('fertile');
    if (mk.ovulation && !mk.period) cls.push('ovulation');
    if (k === today) cls.push('today');
    if (k > today) cls.push('future');
    cells.push(
      <button
        key={k} type="button" className={cls.join(' ')} onClick={() => tap(k)} style={{ '--i': (offset + d - 1) % 7 + Math.floor((offset + d - 1) / 7) }}
        disabled={edit && k > today} aria-label={`${fmtLong(k)}${describe(mk)}`} aria-pressed={edit ? !!mk.period : undefined}
      >
        <span className="n">{d}</span>
        <span className="marks">
          {mk.spot && <i className="m-spot" />}
          {mk.log && <i className="m-log" />}
        </span>
      </button>
    );
  }

  return (
    <div className="stack">
      <section
        className={`card cal ${edit ? 'editing' : ''}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1);
        }}
      >
        <div className="cal-head">
          <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label="Mes anterior"><Icon name="left" /></button>
          <h2 key={monthKey} className={`month-name ${dir}`}>{fmt(monthKey, { month: 'long', year: 'numeric' })}</h2>
          <button type="button" className="icon-btn" onClick={() => move(1)} aria-label="Mes siguiente"><Icon name="right" /></button>
        </div>
        <div className="week" aria-hidden="true">{WEEK.map((w) => <span key={w}>{w}</span>)}</div>
        <div key={monthKey} className={`month ${dir}`}>{cells}</div>

        <div className="cal-actions">
          {edit ? (
            <>
              <p className="hint">Toca los días en que tuviste la regla. Se guarda al momento.</p>
              <button type="button" className="btn primary" onClick={() => setEdit(false)}>Hecho</button>
            </>
          ) : (
            <>
              <button type="button" className="btn ghost" onClick={() => setEdit(true)}>
                <Icon name="drop" size={18} />
                Editar regla
              </button>
              {!isThisMonth && <button type="button" className="link" onClick={() => { setDir(today.slice(0, 7) > monthKey.slice(0, 7) ? 'next' : 'prev'); setYm([Number(today.slice(0, 4)), Number(today.slice(5, 7))]); }}>Ir a hoy</button>}
            </>
          )}
        </div>
      </section>

      <section className="card legend" aria-label="Leyenda">
        <span><i className="lg period" />Regla</span>
        <span><i className="lg predicted" />Prevista</span>
        {!data.settings.hormonal && <span><i className="lg fertile" />Fértil</span>}
        {!data.settings.hormonal && <span><i className="lg ovulation" />Ovulación</span>}
        <span><i className="lg spot" />Manchado</span>
        <span><i className="lg log" />Con notas</span>
      </section>

      {!edit && <p className="fine center">Toca un día para apuntar o ver lo que registraste.</p>}
    </div>
  );
}
