'use client';

import { useMemo, useState } from 'react';
import { addDays, diff, fmtShort, patterns } from '../_lib/cycle';
import { STATE, TREND, label } from '../_lib/catalog';
import { Icon } from './icons';
import Report from './Report';
import CountUp from './CountUp';

const days = (n) => `${n} ${n === 1 ? 'día' : 'días'}`;

// Ciclos como barras: tramo de regla + resto del ciclo, mismo origen, valor al final.
function CycleBars({ s, today }) {
  const [all, setAll] = useState(false);
  const [sel, setSel] = useState(null);
  const rows = s.cycles.map((c) => ({ ...c, current: c.length == null, len: c.length ?? diff(c.start, today) + 1 }));
  const shown = (all ? rows : rows.slice(-8)).slice().reverse();
  const max = Math.max(...rows.map((r) => r.len), s.avgCycle);
  const picked = shown.find((r) => r.start === sel);

  return (
    <section className="card">
      <h2 className="card-title">Tus ciclos</h2>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="sw period" />Regla</span>
        <span><i className="sw rest" />Resto del ciclo</span>
      </div>
      <ol className="bars">
        {shown.map((r) => {
          const p = Math.min(r.periodLength, r.len);
          return (
            <li key={r.start}>
              <button type="button" className={`bar-row ${sel === r.start ? 'on' : ''}`} onClick={() => setSel(sel === r.start ? null : r.start)}>
                <span className="bar-date">{fmtShort(r.start)}</span>
                <span className="bar-track">
                  <span className="bar" style={{ width: `calc((100% - 64px) * ${r.len / max})` }}>
                    <i className="seg period" style={{ flexGrow: p }} />
                    {r.len > p && <i className="seg rest" style={{ flexGrow: r.len - p }} />}
                  </span>
                  <span className="bar-val">{r.current ? `día ${r.len}` : `${r.len} días`}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="readout" aria-live="polite">
        {picked
          ? picked.current
            ? `Ciclo actual: empezó el ${fmtShort(picked.start)}, vas por el día ${picked.len}, regla de ${days(picked.periodLength)}.`
            : `Ciclo del ${fmtShort(picked.start)}: ${days(picked.len)}, regla de ${days(picked.periodLength)}.`
          : 'Toca un ciclo para ver el detalle.'}
      </p>
      {rows.length > 8 && <button type="button" className="link small" onClick={() => setAll(!all)}>{all ? 'Ver solo los últimos' : `Ver los ${rows.length} ciclos`}</button>}
    </section>
  );
}

// Cómo han ido cambiando tus ciclos: línea de duración de ciclo y de regla sobre la banda normal
function TrendChart({ s }) {
  const [sel, setSel] = useState(null);
  const rows = s.cycles.filter((c) => c.length && c.length >= 15 && c.length <= 90).slice(-12);
  if (rows.length < 2) return null;
  const W = 320, H = 190, L = 30, Rr = 12, T = 12, B = 26;
  const lo = Math.min(14, ...rows.map((c) => c.length)) - 2;
  const hi = Math.max(40, ...rows.map((c) => c.length)) + 2;
  const x = (i) => L + (i / (rows.length - 1)) * (W - L - Rr);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = (f) => rows.map((c, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(f(c)).toFixed(1)}`).join(' ');
  const picked = rows.find((c) => c.start === sel) || rows[rows.length - 1];
  const ticks = [20, 28, 36, 44].filter((t) => t > lo && t < hi);
  return (
    <section className="card">
      <h2 className="card-title">Tendencia</h2>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="sw rest" />Ciclo</span>
        <span><i className="sw period" />Regla</span>
        <span><i className="sw band" />Normal (24–38)</span>
      </div>
      <svg className="temp trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Duración de tus últimos ${rows.length} ciclos`}>
        <rect x={L} y={y(38)} width={W - L - Rr} height={y(24) - y(38)} className="band" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - Rr} y1={y(t)} y2={y(t)} className="gl" />
            <text x={L - 6} y={y(t) + 4} className="tick" textAnchor="end">{t}</text>
          </g>
        ))}
        <line x1={L} x2={W - Rr} y1={y(s.avgCycle)} y2={y(s.avgCycle)} className="avg" />
        <text x={L} y={H - 6} className="tick">{fmtShort(rows[0].start)}</text>
        <text x={W - Rr} y={H - 6} className="tick" textAnchor="end">{fmtShort(rows[rows.length - 1].start)}</text>
        <path d={path((c) => c.periodLength)} className="line period" pathLength="100" />
        <path d={path((c) => c.length)} className="line" pathLength="100" />
        {rows.map((c, i) => (
          <g key={c.start} onClick={() => setSel(c.start)} className="pt">
            <circle cx={x(i)} cy={y(c.length)} r="14" className="hit" />
            <circle cx={x(i)} cy={y(c.periodLength)} r={3.5} className="dot period" />
            <circle cx={x(i)} cy={y(c.length)} r={c.start === picked.start ? 6 : 4.5} className="dot" />
          </g>
        ))}
      </svg>
      <p className="readout" aria-live="polite">Ciclo del {fmtShort(picked.start)}: {days(picked.length)}, regla de {days(picked.periodLength)}.</p>
      {s.trend && <p className="hint">{TREND[s.trend]}{s.trend !== 'stable' ? ': los últimos tres frente a los tres anteriores.' : '.'}</p>}
    </section>
  );
}

// "Así está tu ciclo": semáforo de cada medida frente a lo normal
function Assessment({ rows }) {
  const [open, setOpen] = useState(null);
  const bad = rows.filter((r) => r.state && r.state !== 'ok').length;
  return (
    <section className="card">
      <h2 className="card-title">Así está tu ciclo</h2>
      <p className="muted">{rows.every((r) => !r.state) ? 'Con tus primeras reglas apuntadas, aquí verás qué está dentro de lo normal.' : bad ? `${bad} ${bad === 1 ? 'cosa' : 'cosas'} para revisar.` : 'Todo dentro de lo normal.'}</p>
      <ul className="assess">
        {rows.map((r) => (
          <li key={r.id} className={r.state || 'none'}>
            <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}>
              <i className="light" aria-hidden="true" />
              <span><b>{r.title}</b>{r.value && <small>{r.value}</small>}</span>
              <em>{r.state ? STATE[r.state] : 'Sin datos'}</em>
            </button>
            {open === r.id && <p>{r.state && r.state !== 'ok' ? `${r.text} ` : ''}{r.normal}</p>}
          </li>
        ))}
      </ul>
      <p className="fine">Son orientaciones a partir de lo que apuntas, no un diagnóstico. Lo normal sigue los criterios de la FIGO.</p>
    </section>
  );
}

// Temperatura basal del ciclo actual: una sola serie, sin leyenda.
function TempChart({ s, data, today }) {
  const [sel, setSel] = useState(null);
  if (!s.last) return null;
  const pts = [];
  for (let k = s.last.start; k <= today; k = addDays(k, 1)) {
    const t = data.days[k]?.temp;
    if (t) pts.push({ k, d: diff(s.last.start, k) + 1, t });
  }
  if (pts.length < 3) return null;
  const W = 320, H = 170, L = 38, Rr = 12, T = 12, B = 26;
  const lo = Math.floor((Math.min(...pts.map((p) => p.t)) - 0.1) * 10) / 10;
  const hi = Math.ceil((Math.max(...pts.map((p) => p.t)) + 0.1) * 10) / 10;
  const span = Math.max(s.avgCycle, pts[pts.length - 1].d);
  const x = (d) => L + ((d - 1) / Math.max(1, span - 1)) * (W - L - Rr);
  const y = (t) => T + (1 - (t - lo) / (hi - lo)) * (H - T - B);
  const ticks = [lo, (lo + hi) / 2, hi];
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)},${y(p.t).toFixed(1)}`).join(' ');
  const picked = pts.find((p) => p.k === sel) || pts[pts.length - 1];
  const c = (v) => v.toFixed(2).replace('.', ',');

  return (
    <section className="card">
      <h2 className="card-title">Temperatura basal de este ciclo</h2>
      <svg className="temp" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Temperatura basal, ${pts.length} registros, de ${c(lo)} a ${c(hi)} grados`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - Rr} y1={y(t)} y2={y(t)} className="gl" />
            <text x={L - 6} y={y(t) + 4} className="tick" textAnchor="end">{c(t)}</text>
          </g>
        ))}
        <text x={L} y={H - 6} className="tick">día 1</text>
        <text x={W - Rr} y={H - 6} className="tick" textAnchor="end">día {span}</text>
        <path d={path} className="line" pathLength="100" />
        {pts.map((p) => (
          <g key={p.k} onClick={() => setSel(p.k)} className="pt">
            <circle cx={x(p.d)} cy={y(p.t)} r="14" className="hit" />
            <circle cx={x(p.d)} cy={y(p.t)} r={p.k === picked.k ? 6 : 4.5} className="dot" />
          </g>
        ))}
      </svg>
      <p className="readout" aria-live="polite">Día {picked.d} ({fmtShort(picked.k)}): {c(picked.t)} °C</p>
      <p className="hint">Mídela al despertar, antes de levantarte. Tras ovular suele subir unas décimas y quedarse alta hasta la regla.</p>
    </section>
  );
}

function Patterns({ title, list, group }) {
  if (!list.length) return null;
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      <ul className="pattern">
        {list.slice(0, 8).map((p) => (
          <li key={p.id}>
            <b>{label(group, p.id)}</b>
            <span>
              {days(p.times)}
              {p.range && ` · sobre todo ${p.range[0] === p.range[1] ? `el día ${p.range[0]}` : `los días ${p.range[0]}–${p.range[1]}`} del ciclo`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Stats({ s, data, today }) {
  const [report, setReport] = useState(false);
  const sym = useMemo(() => patterns(data, s, 'sym', today), [data, s, today]);
  const mood = useMemo(() => patterns(data, s, 'mood', today), [data, s, today]);

  if (!s.last) {
    return (
      <div className="stack">
        <section className="card soft">
          <h2 className="card-title">Aún no hay ciclos</h2>
          <p>Cuando marques tu primera regla, aquí verás tus medias, tus ciclos, tu temperatura y qué síntomas se repiten.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="tiles">
        <div className="tile"><span>Ciclo medio</span><b><CountUp value={s.avgCycle} /></b><em>días</em></div>
        <div className="tile"><span>Regla media</span><b><CountUp value={s.avgPeriod} /></b><em>días</em></div>
        <div className="tile"><span>Variación</span><b>{s.minCycle != null ? `${s.minCycle}–${s.maxCycle}` : '—'}</b><em>días</em></div>
        <div className="tile"><span>Ciclos completos</span><b><CountUp value={s.cycles.filter((c) => c.length).length} /></b><em>apuntados</em></div>
      </div>
      {s.measured < 3 && <p className="fine">Hasta tener tres ciclos completos, la media usa lo que pusiste en Ajustes.</p>}

      <Assessment rows={s.assessment} />
      <TrendChart s={s} />
      <CycleBars s={s} today={today} />
      <TempChart s={s} data={data} today={today} />
      <Patterns title="Síntomas que se repiten" list={sym} group="sym" />
      <Patterns title="Ánimo que se repite" list={mood} group="mood" />

      <button type="button" className="btn ghost wide" onClick={() => setReport(true)}>
        <Icon name="print" size={18} />
        Informe para la ginecóloga
      </button>
      {report && <Report s={s} data={data} today={today} sym={sym} onClose={() => setReport(false)} />}
    </div>
  );
}
