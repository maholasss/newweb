'use client';

import { useMemo, useState } from 'react';
import { addDays, diff, fmtShort, patterns } from '../_lib/cycle';
import { DEVIATIONS, label } from '../_lib/catalog';
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

      {s.deviations.map((id) => (
        <section key={id} className="card alert">
          <Icon name="alert" />
          <div>
            <h2 className="card-title">{DEVIATIONS[id][0]}</h2>
            <p>{DEVIATIONS[id][1]} Revisa que tus reglas estén bien apuntadas y, si es así, coméntalo con tu ginecóloga.</p>
          </div>
        </section>
      ))}

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
