'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as V from '../_lib/vault';
import * as S from '../_lib/sync';
import { normalize, summarize, todayKey } from '../_lib/cycle';
import Lock from './Lock';
import Today from './Today';
import Calendar from './Calendar';
import Stats from './Stats';
import Settings from './Settings';
import DaySheet from './DaySheet';
import { Icon } from './icons';
import { deliver } from '../_lib/files';

const TABS = [
  ['today', 'Hoy', 'today'],
  ['cal', 'Calendario', 'cal'],
  ['stats', 'Resumen', 'chart'],
  ['set', 'Ajustes', 'gear'],
];

const clean = (day) => {
  const out = {};
  for (const [f, v] of Object.entries(day)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    out[f] = v;
  }
  return out;
};

export default function App() {
  const [data, setData] = useState(null); // null = bloqueada
  const [tab, setTab] = useState('today');
  const [today, setToday] = useState(todayKey);
  const [sheet, setSheet] = useState(null);
  const [editPeriod, setEditPeriod] = useState(false);
  const [saved, setSaved] = useState('saved');
  const session = useRef(null);
  const latest = useRef(null);
  const dirty = useRef(false);
  const lastAct = useRef(0);
  const hiddenAt = useRef(0);

  const flush = useCallback(async () => {
    if (!dirty.current || !session.current || !latest.current) return;
    dirty.current = false;
    try {
      await V.save(session.current, latest.current);
      setSaved('saved');
    } catch {
      dirty.current = true;
      setSaved('error');
    }
  }, []);

  // Cada cambio se cifra y se guarda enseguida.
  useEffect(() => {
    latest.current = data;
    if (!data || !dirty.current) return;
    const t = setTimeout(flush, 250);
    return () => clearTimeout(t);
  }, [data, flush]);

  const update = useCallback((fn) => {
    dirty.current = true;
    setSaved('saving');
    setData((prev) => fn(prev));
  }, []);

  const setDay = useCallback(
    (k, patch) =>
      update((prev) => {
        const day = clean({ ...(prev.days[k] || {}), ...patch });
        const days = { ...prev.days };
        if (Object.keys(day).length) days[k] = day;
        else delete days[k];
        return { ...prev, days };
      }),
    [update]
  );
  const clearDay = useCallback((k) => update((prev) => { const days = { ...prev.days }; delete days[k]; return { ...prev, days }; }), [update]);
  const setSettings = useCallback((patch) => update((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })), [update]);

  const open = useCallback(({ session: s, data: d }) => {
    session.current = s;
    lastAct.current = Date.now();
    dirty.current = false;
    setToday(todayKey());
    setData(normalize(d));
    setSaved('saved');
    V.askPersistence();
  }, []);

  const lock = useCallback(async () => {
    await flush();
    S.disarm();
    session.current = null;
    latest.current = null;
    setData(null);
    setSheet(null);
    setEditPeriod(false);
    setTab('today');
  }, [flush]);

  // Funciona sin conexión una vez instalada.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sfkdd2r9j7-sw.js', { scope: '/sfkdd2r9j7' })
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => {
          const files = performance.getEntriesByType('resource').map((r) => r.name).filter((u) => u.includes('/_next/static/'));
          reg.active?.postMessage({ cache: files });
        })
        .catch(() => {});
    }
  }, []);

  // Se bloquea sola al salir de la app o tras un rato sin tocarla.
  const unlocked = !!data;
  const lockMin = data?.settings.lockMin ?? 1;
  useEffect(() => {
    if (!unlocked) return;
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
        flush();
      } else {
        setToday(todayKey());
        if (hiddenAt.current && Date.now() - hiddenAt.current >= lockMin * 60000) lock();
        hiddenAt.current = 0;
        lastAct.current = Date.now();
      }
    };
    const act = () => (lastAct.current = Date.now());
    const tick = setInterval(() => {
      setToday(todayKey());
      if (Date.now() - lastAct.current >= Math.max(lockMin, 5) * 60000) lock();
    }, 20000);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', flush);
    window.addEventListener('pointerdown', act, { passive: true });
    window.addEventListener('keydown', act);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('pointerdown', act);
      window.removeEventListener('keydown', act);
    };
  }, [unlocked, lockMin, flush, lock]);

  const summary = useMemo(() => (data ? summarize(data, today) : null), [data, today]);
  const closeSheet = useCallback(() => setSheet(null), []);

  // Título grande que se encoge al hacer scroll, como en iOS.
  const [scrolled, setScrolled] = useState(0); // 0 arriba, 1 con barra, 2 con título pequeño
  useEffect(() => {
    if (!unlocked) return;
    const on = () => setScrolled(window.scrollY > 44 ? 2 : window.scrollY > 4 ? 1 : 0);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [unlocked]);

  // Copia cifrada para Archivos / iCloud.
  const exportBackup = useCallback(async () => {
    await flush();
    const rec = await V.seal(session.current, latest.current);
    const file = new File([JSON.stringify(rec)], `luna-copia-${todayKey()}.json`, { type: 'application/json' });
    const ok = await deliver(file);
    if (ok) setSettings({ lastBackup: todayKey() });
    return ok;
  }, [flush, setSettings]);

  const restored = useCallback((res, record) => {
    V.adopt(record);
    open(res);
  }, [open]);

  const changePass = useCallback(async (curUser, curPass, newUser, newPass) => {
    await flush();
    await V.unlock(curUser, curPass); // lanza si no es la actual
    await S.arm(newUser || curUser, newPass);
    session.current = await V.create(newUser || curUser, newPass, latest.current);
  }, [flush]);

  const wipeAll = useCallback(() => {
    session.current = null;
    latest.current = null;
    dirty.current = false;
    V.wipe();
    S.disarm();
    setData(null);
    setTab('today');
  }, []);

  if (!data) return <Lock onOpen={open} />;

  const title = { today: 'Hoy', cal: 'Calendario', stats: 'Resumen', set: 'Ajustes' }[tab];
  const go = (t) => {
    setTab(t);
    if (t !== 'cal') setEditPeriod(false);
    setScrolled(0);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <header className={`nav ${scrolled ? 'scrolled' : ''} ${scrolled === 2 ? 'titled' : ''}`}>
        <span className={`saved ${saved}`} role="status">
          <i />
          {saved === 'error' ? 'Sin guardar' : saved === 'saving' ? 'Guardando' : 'Cifrado'}
        </span>
        <span className="nav-title" aria-hidden="true">{title}</span>
        <button type="button" className="icon-btn" onClick={lock} aria-label="Bloquear">
          <Icon name="lock" />
        </button>
      </header>

      <main className="main" key={tab}>
        <h1 className="large-title">{title}</h1>
        {tab === 'today' && (
          <Today
            s={summary} data={data} today={today} setDay={setDay}
            openDay={setSheet}
            editPast={() => { setEditPeriod(true); go('cal'); }}
            goBackup={() => go('set')}
          />
        )}
        {tab === 'cal' && <Calendar s={summary} data={data} today={today} setDay={setDay} openDay={setSheet} edit={editPeriod} setEdit={setEditPeriod} />}
        {tab === 'stats' && <Stats s={summary} data={data} today={today} />}
        {tab === 'set' && (
          <Settings
            s={summary} data={data} today={today} setSettings={setSettings}
            exportBackup={exportBackup} restored={restored} changePass={changePass} wipeAll={wipeAll} lock={lock}
          />
        )}
      </main>

      <nav className="tabs" aria-label="Secciones">
        {TABS.map(([id, label, icon]) => (
          <button key={id} type="button" className={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {sheet && <DaySheet k={sheet} s={summary} data={data} today={today} setDay={setDay} clearDay={clearDay} onClose={closeSheet} />}
    </div>
  );
}
