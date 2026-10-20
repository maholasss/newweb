'use client';

import { useState } from 'react';
import { addDays, diff, fmtLong, fmtShort, isBleed, hadSex } from '../_lib/cycle';
import { FLOW, PHASES, CHANCE, OV_SOURCE, FLAGS, TIPS, chipsOf } from '../_lib/catalog';
import { Icon } from './icons';
import CountUp from './CountUp';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const SEX_OPTS = [['protected', 'Con protección'], ['unprotected', 'Sin protección'], ['solo', 'En solitario']];

// Corazón para apuntar relaciones en un toque, como en Flo
function SexRow({ day, k, setDay }) {
  const [open, setOpen] = useState(false);
  const cur = day?.sex || [];
  const has = hadSex(day);
  const toggle = (id) => setDay(k, { sex: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur.filter((x) => !SEX_OPTS.some(([o]) => o === x)), id] });
  return (
    <div className="sex-row">
      <button type="button" className={`heart ${has ? 'on' : ''}`} aria-pressed={has} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="heart" size={20} />
        {has ? SEX_OPTS.find(([o]) => cur.includes(o))?.[1] : 'Relaciones'}
      </button>
      {open && (
        <div className="chips">
          {SEX_OPTS.map(([id, l]) => (
            <button key={id} type="button" className={`chip sex ${cur.includes(id) ? 'on' : ''}`} aria-pressed={cur.includes(id)} onClick={() => toggle(id)}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Ring({ s }) {
  const R = 104;
  const L = Math.max(s.avgCycle, s.cycleDay || 0);
  // Arcos en unidades de pathLength=100, con un hueco de 1 entre tramos.
  const arc = (a, b) => {
    const f0 = Math.max(0, ((a - 1) / L) * 100);
    const f1 = Math.min(100, (b / L) * 100);
    return { strokeDasharray: `${Math.max(0.01, f1 - f0 - 1)} 100`, strokeDashoffset: -(f0 + 0.5) };
  };
  let period = null;
  let fertile = null;
  let dot = null;
  if (s.last) {
    period = arc(1, s.ongoing ? Math.max(s.periodDay, 1) : s.last.length);
    const w = s.windows.find((x) => x.ov === s.ovulation);
    if (w) fertile = arc(diff(s.last.start, w.start) + 1, diff(s.last.start, w.end) + 1);
    const t = ((s.cycleDay - 0.5) / L) * 2 * Math.PI - Math.PI / 2;
    dot = [130 + R * Math.cos(t), 130 + R * Math.sin(t)];
  }

  let small = '';
  let big = '';
  let num = null; // [antes, número, después] para que el número suba contando
  let sub = '';
  switch (s.phase) {
    case 'none': small = 'Hola'; big = 'Empieza'; sub = 'marca tu última regla'; break;
    case 'period': small = 'Regla'; big = `Día ${s.periodDay}`; num = ['Día ', s.periodDay, '']; break;
    case 'due': small = 'Hoy'; big = 'Toca regla'; break;
    case 'late': small = 'Retraso'; big = plural(s.late, 'día', 'días'); num = ['', s.late, s.late === 1 ? ' día' : ' días']; break;
    default: small = 'Regla en'; big = plural(s.daysToNext, 'día', 'días'); num = ['', s.daysToNext, s.daysToNext === 1 ? ' día' : ' días'];
  }
  if (s.cycleDay) sub = `día ${s.cycleDay} del ciclo`;

  return (
    <div className="ring">
      <svg viewBox="0 0 260 260" role="img" aria-label={`${small} ${big}, ${sub}`}>
        <circle cx="130" cy="130" r={R} className="ring-track" />
        {fertile && <circle cx="130" cy="130" r={R} pathLength="100" className="ring-arc ring-fertile" style={fertile} transform="rotate(-90 130 130)" />}
        {period && <circle cx="130" cy="130" r={R} pathLength="100" className="ring-arc ring-period" style={period} transform="rotate(-90 130 130)" />}
        {dot && <circle cx={dot[0]} cy={dot[1]} r="9" className="ring-dot" />}
      </svg>
      <div className="ring-text">
        <span className="ring-small" aria-hidden="true">{small}</span>
        <span className="ring-big" aria-hidden="true">{num ? <>{num[0]}<CountUp value={num[1]} />{num[2]}</> : big}</span>
        {sub && <span className="ring-sub" aria-hidden="true">{sub}</span>}
      </div>
    </div>
  );
}

export default function Today({ s, data, today, setDay, openDay, editPast, goBackup }) {
  const day = data.days[today];
  const yesterday = data.days[addDays(today, -1)];
  const bleedingToday = isBleed(day);
  const askContinue = s.phase === 'period' && !bleedingToday;
  const chips = chipsOf(day);
  const hormonal = data.settings.hormonal;
  const nextStart = s.predicted[0]?.start;
  const nextWindow = s.windows.find((w) => w.end >= today);
  const logged = Object.keys(data.days).length;
  const lb = data.settings.lastBackup;
  const needBackup = logged >= 5 && (!lb || diff(lb, today) > 30);

  return (
    <div className="stack">
      <p className="subtitle">{fmtLong(today)}</p>
      <Ring s={s} />
      <p className="phase-chip">
        <i className={`phase-dot ${s.phase}`} />
        {PHASES[s.phase].name}
      </p>

      {askContinue ? (
        <section className="card center">
          <h2 className="card-title">¿Sigues con la regla hoy?</h2>
          <div className="row-btns">
            <button type="button" className="btn primary" onClick={() => setDay(today, { flow: isBleed(yesterday) ? yesterday.flow : 'medium' })}>Sí</button>
            <button type="button" className="btn ghost" onClick={() => setDay(today, { flow: 'none' })}>No, ya terminó</button>
          </div>
        </section>
      ) : bleedingToday ? (
        <section className="card">
          <h2 className="card-title">Cómo es hoy</h2>
          <div className="chips">
            {FLOW.filter(([id]) => id !== 'spot').map(([id, l]) => (
              <button key={id} type="button" className={`chip flow ${day.flow === id ? 'on' : ''}`} aria-pressed={day.flow === id} onClick={() => setDay(today, { flow: id })}>
                <Icon name="drop" size={16} />
                {l}
              </button>
            ))}
          </div>
          <button type="button" className="link small" onClick={() => setDay(today, { flow: 'none' })}>Hoy no tengo regla</button>
        </section>
      ) : (
        <section className="card center">
          <button type="button" className="btn period wide" onClick={() => setDay(today, { flow: 'medium' })}>
            <Icon name="drop" size={18} />
            Me ha venido la regla hoy
          </button>
          <button type="button" className="link" onClick={editPast}>Me vino otro día</button>
        </section>
      )}

      <section className="card">
        <h2 className="card-title">Tu día</h2>
        {chips.length ? (
          <div className="chips readonly">{chips.map((c, i) => <span key={i} className={`chip ${c.g}`}>{c.t}</span>)}</div>
        ) : (
          <p className="muted">Aún no has apuntado nada hoy.</p>
        )}
        <SexRow day={day} k={today} setDay={setDay} />
        <button type="button" className="btn ghost wide" onClick={() => openDay(today)}>
          <Icon name="plus" size={18} />
          Síntomas, ánimo, flujo y más
        </button>
      </section>

      {s.flags.map((id) => (
        <section key={id} className="card alert">
          <Icon name="alert" />
          <div>
            <h2 className="card-title">{FLAGS[id][0]}</h2>
            <p>{FLAGS[id][1]}</p>
          </div>
        </section>
      ))}

      {s.last && (
        <section className="card">
          <h2 className="card-title">Lo que viene</h2>
          <dl className="facts">
            <div>
              <dt><i className="key period" />Próxima regla</dt>
              <dd>
                {s.late > 0 ? `Con ${plural(s.late, 'día', 'días')} de retraso` : s.phase === 'due' ? 'Hoy' : s.ongoing ? fmtShort(nextStart) : `${fmtShort(nextStart)} · en ${plural(s.daysToNext, 'día', 'días')}`}
              </dd>
            </div>
            {s.late === 0 && s.phase !== 'due' && s.spread > 0 && (
              <div>
                <dt>Margen</dt>
                <dd>{s.spread === 1 ? 'un día arriba o abajo' : `entre el ${fmtShort(s.nextRange[0])} y el ${fmtShort(s.nextRange[1])}`}</dd>
              </div>
            )}
            {!hormonal && nextWindow && (
              <>
                <div>
                  <dt><i className="key fertile" />Ventana fértil</dt>
                  <dd>{nextWindow.start <= today ? `Ahora, hasta el ${fmtShort(nextWindow.end)}` : `${fmtShort(nextWindow.start)} – ${fmtShort(nextWindow.end)}`}</dd>
                </div>
                <div>
                  <dt><i className="key ovulation" />Ovulación</dt>
                  <dd>{nextWindow.ov === today ? 'Hoy' : fmtShort(nextWindow.ov)}{nextWindow.ov === s.ovulation && s.ovSource !== 'calendar' ? ` · ${OV_SOURCE[s.ovSource]}` : ''}</dd>
                </div>
                {s.chance && (
                  <div>
                    <dt><Icon name="heart" size={14} className={`chance ${s.chance}`} />Embarazo hoy</dt>
                    <dd>{CHANCE[s.chance]} probabilidad</dd>
                  </div>
                )}
              </>
            )}
            <div>
              <dt>Tu media</dt>
              <dd>Ciclo de {s.avgCycle} días · regla de {s.avgPeriod}{s.lutealLearned ? ` · lútea de ${s.luteal}` : ''}</dd>
            </div>
          </dl>
          {s.measured < 3 && <p className="hint">Con tres ciclos apuntados las predicciones ya salen de tus datos reales.</p>}
        </section>
      )}

      <section className="card soft">
        <h2 className="card-title">{PHASES[s.phase].name}</h2>
        <p>{PHASES[s.phase].text}</p>
        {s.phase === 'none' && (
          <button type="button" className="btn primary wide" onClick={editPast}>Marcar mi última regla</button>
        )}
        <ul className="tips">
          {TIPS[s.phase].map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      {needBackup && (
        <button type="button" className="banner" onClick={goBackup}>
          <Icon name="shield" />
          <span>
            <b>Guarda una copia de seguridad</b>
            Tus datos solo están en este dispositivo. {lb ? `La última copia es del ${fmtShort(lb)}.` : 'Aún no has hecho ninguna.'}
          </span>
        </button>
      )}

      <p className="fine">Las predicciones son estimaciones y no sirven como método anticonceptivo. Si algo te preocupa, consúltalo con tu ginecóloga.</p>
    </div>
  );
}
