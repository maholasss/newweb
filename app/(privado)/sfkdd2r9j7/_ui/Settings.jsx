'use client';

import { useRef, useState } from 'react';
import * as V from '../_lib/vault';
import { addDays, fmtShort } from '../_lib/cycle';
import { Icon } from './icons';
import { deliver } from '../_lib/files';

function Stepper({ label, hint, value, min, max, onChange }) {
  return (
    <div className="setting">
      <div>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </div>
      <div className="stepper">
        <button type="button" aria-label={`Menos: ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Más: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function ics(starts) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const events = starts.map((k) => {
    const d = k.replace(/-/g, '');
    return [
      'BEGIN:VEVENT', `UID:luna-${d}@luna`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${addDays(k, 1).replace(/-/g, '')}`, 'SUMMARY:Luna', 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Luna', 'TRIGGER:-PT15H', 'END:VALARM', 'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Luna//ES', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}

const LOCKS = [[0, 'Al salir'], [1, '1 min'], [5, '5 min'], [15, '15 min']];

export default function Settings({ s, data, today, setSettings, exportBackup, restored, changePass, wipeAll, lock }) {
  const st = data.settings;
  const fileRef = useRef(null);
  const [backupMsg, setBackupMsg] = useState('');
  const [rec, setRec] = useState(null);
  const [ru, setRu] = useState('');
  const [rp, setRp] = useState('');
  const [pw, setPw] = useState({ open: false, cu: '', cp: '', nu: '', np: '', np2: '', msg: '', busy: false });
  const setP = (patch) => setPw((p) => ({ ...p, ...patch }));

  async function doExport() {
    setBackupMsg('');
    try {
      const ok = await exportBackup();
      if (ok) setBackupMsg('Copia lista. En iPhone elige «Guardar en Archivos» y guárdala en iCloud Drive.');
    } catch {
      setBackupMsg('No se ha podido crear la copia.');
    }
  }

  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const r = JSON.parse(await f.text());
      if (!V.isRecord(r)) throw new Error();
      if (!window.confirm('Esto sustituye todo lo que hay en este dispositivo por lo que hay en la copia. ¿Seguir?')) return;
      setRec(r);
      setBackupMsg('');
    } catch {
      setBackupMsg('Ese archivo no es una copia de Luna.');
    }
  }

  async function doRestore(e) {
    e.preventDefault();
    try {
      const res = await V.unlock(ru, rp, rec);
      restored(res, rec);
    } catch {
      setBackupMsg('Esa copia no se abre con ese usuario y contraseña.');
      setRp('');
    }
  }

  async function doChange(e) {
    e.preventDefault();
    if (pw.np.length < 8) return setP({ msg: 'La nueva contraseña necesita al menos 8 caracteres.' });
    if (pw.np !== pw.np2) return setP({ msg: 'Las dos contraseñas nuevas no coinciden.' });
    setP({ busy: true, msg: '' });
    try {
      await changePass(pw.cu, pw.cp, pw.nu.trim(), pw.np);
      setPw({ open: false, cu: '', cp: '', nu: '', np: '', np2: '', msg: 'Contraseña cambiada. Úsala la próxima vez que entres.', busy: false });
    } catch {
      setP({ busy: false, cp: '', msg: 'El usuario o la contraseña actual no son correctos.' });
    }
  }

  async function calendar() {
    const starts = s.predicted.slice(0, 3).map((p) => p.start);
    const file = new File([ics(starts)], 'luna.ics', { type: 'text/calendar' });
    await deliver(file);
  }

  function wipe() {
    if (!window.confirm('¿Borrar todos tus datos de este dispositivo? No se puede deshacer.')) return;
    if (!window.confirm('Última confirmación: se borra todo. Si no tienes copia, se pierde para siempre.')) return;
    wipeAll();
  }

  return (
    <div className="stack">
      <section className="card">
        <h2 className="card-title">Tu ciclo</h2>
        <Stepper label="Duración del ciclo" hint="Se usa hasta que tengas tres ciclos apuntados" value={st.cycle} min={20} max={45} onChange={(v) => setSettings({ cycle: v })} />
        <Stepper label="Duración de la regla" value={st.period} min={2} max={10} onChange={(v) => setSettings({ period: v })} />
        <Stepper label="Fase lútea" hint="Días entre la ovulación y la regla. Casi siempre 14" value={st.luteal} min={10} max={16} onChange={(v) => setSettings({ luteal: v })} />
        <label className="setting switch">
          <div>
            <b>Uso anticonceptivo hormonal</b>
            <small>Píldora, anillo, parche, DIU hormonal… Oculta ovulación y días fértiles</small>
          </div>
          <input type="checkbox" role="switch" checked={st.hormonal} onChange={(e) => setSettings({ hormonal: e.target.checked })} />
        </label>
      </section>

      <section className="card">
        <h2 className="card-title">Seguridad</h2>
        <div className="setting col">
          <div>
            <b>Bloquear al salir de la app</b>
            <small>Y siempre tras {Math.max(st.lockMin, 5)} minutos sin tocarla</small>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Bloquear al salir">
            {LOCKS.map(([v, l]) => (
              <button key={v} type="button" role="radio" aria-checked={st.lockMin === v} className={st.lockMin === v ? 'on' : ''} onClick={() => setSettings({ lockMin: v })}>{l}</button>
            ))}
          </div>
        </div>

        {pw.open ? (
          <form className="pw-form" onSubmit={doChange}>
            <label className="field"><span>Usuario actual</span><input autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw.cu} onChange={(e) => setP({ cu: e.target.value })} /></label>
            <label className="field"><span>Contraseña actual</span><input type="password" autoComplete="current-password" value={pw.cp} onChange={(e) => setP({ cp: e.target.value })} /></label>
            <label className="field"><span>Nuevo usuario <small>(vacío = el mismo)</small></span><input autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw.nu} onChange={(e) => setP({ nu: e.target.value })} /></label>
            <label className="field"><span>Nueva contraseña</span><input type="password" autoComplete="new-password" value={pw.np} onChange={(e) => setP({ np: e.target.value })} /></label>
            <label className="field"><span>Repite la nueva</span><input type="password" autoComplete="new-password" value={pw.np2} onChange={(e) => setP({ np2: e.target.value })} /></label>
            <div className="row-btns">
              <button className="btn primary" disabled={pw.busy}>{pw.busy ? 'Cambiando…' : 'Cambiar'}</button>
              <button type="button" className="btn ghost" onClick={() => setPw({ open: false, cu: '', cp: '', nu: '', np: '', np2: '', msg: '', busy: false })}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn ghost wide" onClick={() => setP({ open: true, msg: '' })}>Cambiar usuario o contraseña</button>
        )}
        {pw.msg && <p className="msg" role="status">{pw.msg}</p>}
        <button type="button" className="btn ghost wide" onClick={lock}><Icon name="lock" size={18} />Bloquear ahora</button>
      </section>

      <section className="card">
        <h2 className="card-title">Copia de seguridad</h2>
        <p className="msg" role="status">Cada cambio se guarda también en la nube, cifrado con tu contraseña. Si entras en otro móvil con el mismo usuario y contraseña, aparece todo.</p>
        <p>Tus datos solo están en este dispositivo. Guarda una copia de vez en cuando: sirve para no perder nada y para pasarlo a otro móvil o al Mac. La copia va cifrada con tu contraseña.</p>
        <p className="muted">{st.lastBackup ? `Última copia: ${fmtShort(st.lastBackup)} ${st.lastBackup.slice(0, 4)}` : 'Aún no has hecho ninguna copia.'}</p>
        <div className="row-btns">
          <button type="button" className="btn primary" onClick={doExport}><Icon name="share" size={18} />Guardar copia</button>
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}><Icon name="upload" size={18} />Restaurar</button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={pick} />
        {rec && (
          <form className="pw-form" onSubmit={doRestore}>
            <p className="hint">Escribe el usuario y la contraseña con los que se guardó la copia.</p>
            <label className="field"><span>Usuario</span><input autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={ru} onChange={(e) => setRu(e.target.value)} /></label>
            <label className="field"><span>Contraseña</span><input type="password" autoComplete="current-password" value={rp} onChange={(e) => setRp(e.target.value)} /></label>
            <div className="row-btns">
              <button className="btn primary">Restaurar copia</button>
              <button type="button" className="btn ghost" onClick={() => setRec(null)}>Cancelar</button>
            </div>
          </form>
        )}
        {backupMsg && <p className="msg" role="status">{backupMsg}</p>}
      </section>

      <section className="card">
        <h2 className="card-title">Avisos</h2>
        <p>Añade tus tres próximas reglas al Calendario, con aviso el día antes. El evento solo dice «Luna».</p>
        <button type="button" className="btn ghost wide" onClick={calendar} disabled={!s.predicted.length}><Icon name="bell" size={18} />Añadir al Calendario</button>
        {!s.predicted.length && <p className="hint">Marca tu última regla para poder calcularlas.</p>}
      </section>

      <section className="card">
        <h2 className="card-title">Tenerla como app</h2>
        <p><b>iPhone:</b> ábrela en Safari, toca Compartir y luego «Añadir a pantalla de inicio».</p>
        <p><b>Mac:</b> en Safari, menú Archivo y luego «Añadir al Dock».</p>
        <p className="hint">Cada app instalada guarda sus propios datos. Para pasarlos de una a otra, usa la copia de seguridad.</p>
      </section>

      <section className="card soft">
        <h2 className="card-title"><Icon name="shield" size={18} /> Privacidad</h2>
        <p>Todo se guarda cifrado (AES-256) solo en este dispositivo. No se envía a ningún servidor y nadie más puede leerlo. La contraseña no se guarda en ningún sitio: si la olvidas, no hay forma de recuperar los datos.</p>
      </section>

      <button type="button" className="btn danger wide" onClick={wipe}><Icon name="trash" size={18} />Borrar todos mis datos</button>
      <p className="fine center">Luna · {today.slice(0, 4)}</p>
    </div>
  );
}
