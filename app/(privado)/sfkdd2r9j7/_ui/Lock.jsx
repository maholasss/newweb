'use client';

import { useRef, useState } from 'react';
import * as V from '../_lib/vault';
import * as S from '../_lib/sync';
import { emptyData } from '../_lib/cycle';
import { Moon } from './icons';

const WAIT = 'luna:wait';
const now = () => Date.now();
const FAILS = 'luna:fails';
const get = (k) => {
  try {
    return Number(localStorage.getItem(k) || 0);
  } catch {
    return 0;
  }
};
const set = (k, v) => {
  try {
    localStorage.setItem(k, String(v));
  } catch {}
};

export default function Lock({ onOpen }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [step, setStep] = useState('login'); // login | new
  const [backup, setBackup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [leaving, setLeaving] = useState(false);
  const fileRef = useRef(null);
  const formRef = useRef(null);

  // Temblor de iOS cuando la contraseña no es.
  const shake = () =>
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    formRef.current?.animate(
      [0, -12, 10, -8, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 420, easing: 'ease-out' }
    );

  // Al entrar, la pantalla se desvanece hacia delante, como al desbloquear el iPhone.
  const leave = (then) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return then();
    setLeaving(true);
    setTimeout(then, 360);
  };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const wait = get(WAIT) - now();
    if (wait > 0) return setMsg(`Demasiados intentos. Espera ${Math.ceil(wait / 1000)} segundos.`);
    if (!user.trim() || !pass) return setMsg('Escribe tu usuario y tu contraseña.');

    if (step === 'new') return createNew();
    let record = backup || V.readVault();
    setBusy(true);
    setMsg('');
    // Si en la nube hay una copia más nueva (o aquí no hay ninguna), se usa esa
    let cloud = null;
    try { cloud = await S.pull(user, pass); } catch {}
    if (cloud && (!record || (cloud.at || 0) > (record.at || 0))) {
      try { await V.unlock(user, pass, cloud); record = cloud; V.adopt(cloud); } catch {}
    }
    if (!record) {
      setBusy(false);
      setStep('new');
      setMsg('');
      return;
    }
    try {
      const res = await V.unlock(user, pass, record);
      if (backup) V.adopt(backup);
      set(FAILS, 0);
      const creds = await S.arm(user, pass);
      if (!cloud || (record.at || 0) > (cloud.at || 0)) S.push(record).catch(() => {});
      await V.rememberSession(res.session, creds);
      leave(() => onOpen(res));
    } catch {
      const fails = get(FAILS) + 1;
      // Tras 5 fallos, espera creciente: 30 s, 60 s, 120 s…
      if (fails >= 5) set(WAIT, now() + 30000 * 2 ** Math.min(fails - 5, 6));
      set(FAILS, fails);
      setMsg(backup ? 'Esa copia no se abre con ese usuario y contraseña.' : 'Usuario o contraseña incorrectos.');
      shake();
      setPass('');
      setBusy(false);
    }
  }

  async function createNew() {
    if (pass.length < 8) return setMsg('La contraseña necesita al menos 8 caracteres.');
    if (pass !== pass2) return setMsg('Las dos contraseñas no coinciden.');
    setBusy(true);
    setMsg('');
    try {
      const data = emptyData();
      const creds = await S.arm(user, pass);
      const session = await V.create(user, pass, data);
      await V.rememberSession(session, creds);
      leave(() => onOpen({ session, data }));
    } catch {
      setMsg('No se ha podido guardar en este dispositivo. Si estás en navegación privada, ábrela en una ventana normal.');
      setBusy(false);
    }
  }

  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const r = JSON.parse(await f.text());
      if (!V.isRecord(r)) throw new Error();
      setBackup(r);
      setStep('login');
      setPass('');
      setMsg('Copia cargada. Escribe el usuario y la contraseña con los que la guardaste.');
    } catch {
      setMsg('Ese archivo no es una copia de Luna.');
    }
  }

  const isNew = step === 'new';

  return (
    <div className={`lock ${leaving ? 'leaving' : ''}`}>
      <form ref={formRef} className="lock-card" onSubmit={submit} noValidate>
        <Moon />
        <h1 className="display">Luna</h1>
        {isNew && <p className="muted">En este dispositivo todavía no hay ningún diario. Crea uno con este usuario y contraseña, o restaura una copia.</p>}

        <label className="field">
          <span>Usuario</span>
          <input
            name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            value={user} onChange={(e) => setUser(e.target.value)} disabled={busy}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            name="password" type="password" autoComplete={isNew ? 'new-password' : 'current-password'}
            value={pass} onChange={(e) => setPass(e.target.value)} disabled={busy}
          />
        </label>
        {isNew && (
          <label className="field">
            <span>Repite la contraseña</span>
            <input name="password2" type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} disabled={busy} />
          </label>
        )}

        <button className="btn primary wide" disabled={busy}>
          {busy ? 'Abriendo…' : isNew ? 'Crear mi diario' : 'Entrar'}
        </button>
        <p className="msg" role="alert">{msg}</p>

        {isNew && (
          <div className="lock-more">
            <button type="button" className="btn ghost wide" onClick={() => fileRef.current?.click()}>Restaurar una copia</button>
            <button type="button" className="link" onClick={() => { setStep('login'); setMsg(''); setPass2(''); }}>Volver</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={pick} />
      </form>
    </div>
  );
}
