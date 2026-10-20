'use client';

import { useState } from 'react';
import { cycleDayOf, fmtLong } from '../_lib/cycle';
import { FLOW, GROUPS } from '../_lib/catalog';
import { Icon } from './icons';
import Sheet from './Sheet';

const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const show = (v) => (v == null ? '' : String(v).replace('.', ','));

function NumberField({ label, unit, value, min, max, onChange }) {
  const [text, setText] = useState(show(value));
  return (
    <label className="field inline">
      <span>{label}</span>
      <span className="with-unit">
        <input
          inputMode="decimal" placeholder="—" value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = num(e.target.value);
            if (e.target.value.trim() === '') onChange(null);
            else if (n != null && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => {
            const n = num(text);
            if (text.trim() !== '' && (n == null || n < min || n > max)) setText(show(value));
          }}
        />
        <em>{unit}</em>
      </span>
    </label>
  );
}

export default function DaySheet({ k, s, data, today, setDay, clearDay, onClose }) {
  const day = data.days[k] || {};
  const future = k > today;
  const cd = cycleDayOf(s, k);
  const [reset, setReset] = useState(0);

  const pickOne = (g, id) => setDay(k, { [g]: day[g] === id ? null : id });
  const pickMany = (g, id) => {
    const cur = day[g] || [];
    setDay(k, { [g]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };

  return (
    <Sheet
      label={fmtLong(k)}
      onClose={onClose}
      head={(close) => (
        <>
          <div>
            <h2 className="display">{fmtLong(k)}</h2>
            {cd && !future && <p className="muted">Día {cd} del ciclo</p>}
          </div>
          <button type="button" className="text-btn" onClick={close}>Hecho</button>
        </>
      )}
    >
      <div className="sheet-body">
        {future ? (
          <p className="hint">Es un día que aún no ha llegado: puedes dejar una nota, y el resto lo apuntas cuando llegue.</p>
        ) : (
          <>
            <fieldset className="group">
              <legend>Regla</legend>
              <div className="chips">
                <button type="button" className={`chip ${day.flow === 'none' ? 'on' : ''}`} aria-pressed={day.flow === 'none'} onClick={() => pickOne('flow', 'none')}>Nada</button>
                {FLOW.map(([id, l]) => (
                  <button key={id} type="button" className={`chip flow ${day.flow === id ? 'on' : ''}`} aria-pressed={day.flow === id} onClick={() => pickOne('flow', id)}>
                    <Icon name="drop" size={16} />
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>

            {GROUPS.map((g) => (
              <fieldset className="group" key={g.id}>
                <legend>{g.title}</legend>
                <div className="chips">
                  {g.items.map(([id, l]) => {
                    const on = g.multi ? (day[g.id] || []).includes(id) : day[g.id] === id;
                    return (
                      <button key={id} type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => (g.multi ? pickMany(g.id, id) : pickOne(g.id, id))}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <fieldset className="group" key={reset}>
              <legend>Medidas</legend>
              <NumberField label="Temperatura basal" unit="°C" value={day.temp} min={34} max={42} onChange={(v) => setDay(k, { temp: v })} />
              <NumberField label="Peso" unit="kg" value={day.weight} min={25} max={300} onChange={(v) => setDay(k, { weight: v })} />
            </fieldset>
          </>
        )}

        <fieldset className="group">
          <legend>Nota</legend>
          <textarea rows={3} placeholder="Lo que quieras recordar de este día" value={day.note || ''} onChange={(e) => setDay(k, { note: e.target.value })} />
        </fieldset>

        {Object.keys(day).length > 0 && (
          <button
            type="button" className="link danger"
            onClick={() => {
              if (!window.confirm('¿Borrar todo lo apuntado este día?')) return;
              clearDay(k);
              setReset((n) => n + 1);
            }}
          >
            Borrar este día
          </button>
        )}
      </div>
    </Sheet>
  );
}
