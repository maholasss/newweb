'use client';

import { useEffect } from 'react';
import Sheet from './Sheet';
import { addDays, fmt, fmtShort } from '../_lib/cycle';
import { DEVIATIONS, label } from '../_lib/catalog';
import { Icon } from './icons';

const long = (k) => fmt(k, { day: 'numeric', month: 'long', year: 'numeric' });

export default function Report({ s, data, today, sym, onClose }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('printing');
    return () => root.classList.remove('printing');
  }, []);

  const cycles = s.cycles.slice(-12).reverse();
  const from = addDays(today, -365);
  const meds = {};
  for (const [k, d] of Object.entries(data.days)) if (k >= from) (d.meds || []).forEach((m) => (meds[m] = (meds[m] || 0) + 1));

  const lines = [
    `Resumen de mi ciclo · ${long(today)}`,
    `Ciclo medio: ${s.avgCycle} días${s.minCycle != null ? ` (entre ${s.minCycle} y ${s.maxCycle})` : ''}. Regla media: ${s.avgPeriod} días.`,
    `Última regla: ${long(s.last.start)} (${s.last.length} días).`,
    ...s.deviations.map((id) => `Aviso: ${DEVIATIONS[id][0]}. ${DEVIATIONS[id][1]}`),
    'Ciclos:',
    ...cycles.map((c) => `· ${long(c.start)}: ${c.length ? `${c.length} días` : 'en curso'}, regla de ${c.periodLength} días`),
    ...(sym.length ? ['Síntomas frecuentes (12 meses):', ...sym.slice(0, 8).map((p) => `· ${label('sym', p.id)}: ${p.times} días${p.range ? `, días ${p.range[0]}–${p.range[1]} del ciclo` : ''}`)] : []),
  ];

  const share = async () => {
    const text = lines.join('\n');
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <Sheet
      label="Informe"
      className="report"
      onClose={onClose}
      head={(close) => (
        <>
          <h2 className="display">Informe</h2>
          <button type="button" className="text-btn" onClick={close}>Cerrar</button>
        </>
      )}
    >
      <div className="sheet-body">
        <h1 className="display">Resumen de mi ciclo</h1>
        <p className="muted">Generado el {long(today)}</p>

        <dl className="facts">
          <div><dt>Ciclo medio</dt><dd>{s.avgCycle} días{s.minCycle != null && ` (de ${s.minCycle} a ${s.maxCycle})`}</dd></div>
          <div><dt>Regla media</dt><dd>{s.avgPeriod} días</dd></div>
          <div><dt>Última regla</dt><dd>{long(s.last.start)} · {s.last.length} días</dd></div>
          {!data.settings.hormonal ? null : <div><dt>Anticonceptivo hormonal</dt><dd>Sí</dd></div>}
        </dl>

        {s.deviations.length > 0 && (
          <>
            <h3>Avisos</h3>
            <ul>{s.deviations.map((id) => <li key={id}><b>{DEVIATIONS[id][0]}.</b> {DEVIATIONS[id][1]}</li>)}</ul>
          </>
        )}

        <h3>Últimos ciclos</h3>
        <table>
          <thead><tr><th>Inicio</th><th>Ciclo</th><th>Regla</th></tr></thead>
          <tbody>
            {cycles.map((c) => (
              <tr key={c.start}><td>{fmtShort(c.start)} {c.start.slice(0, 4)}</td><td>{c.length ? `${c.length} días` : 'en curso'}</td><td>{c.periodLength} días</td></tr>
            ))}
          </tbody>
        </table>

        {sym.length > 0 && (
          <>
            <h3>Síntomas frecuentes (últimos 12 meses)</h3>
            <ul>{sym.slice(0, 8).map((p) => <li key={p.id}>{label('sym', p.id)}: {p.times} días{p.range && `, sobre todo días ${p.range[0]}–${p.range[1]} del ciclo`}</li>)}</ul>
          </>
        )}
        {Object.keys(meds).length > 0 && (
          <>
            <h3>Medicación apuntada (últimos 12 meses)</h3>
            <ul>{Object.entries(meds).map(([m, n]) => <li key={m}>{label('meds', m)}: {n} días</li>)}</ul>
          </>
        )}

        <div className="row-btns no-print">
          <button type="button" className="btn ghost" onClick={share}><Icon name="share" size={18} />Compartir</button>
          <button type="button" className="btn ghost" onClick={() => window.print()}><Icon name="print" size={18} />Imprimir o PDF</button>
        </div>
      </div>
    </Sheet>
  );
}
