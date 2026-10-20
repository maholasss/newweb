// Fechas como claves 'AAAA-MM-DD' y toda la lógica del ciclo: reglas, predicciones,
// ventana fértil, fases y avisos (criterios de la FIGO, los mismos que usa Salud de Apple).

const DAY = 86400000;
const pad = (n) => String(n).padStart(2, '0');

export const localKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => localKey(new Date());
export const toNum = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};
export const fromNum = (n) => {
  const t = new Date(n * DAY);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};
export const addDays = (k, n) => fromNum(toNum(k) + n);
export const diff = (a, b) => toNum(b) - toNum(a);
export const asDate = (k) => new Date(toNum(k) * DAY);

const fmtCache = {};
export function fmt(k, opts) {
  const id = JSON.stringify(opts);
  fmtCache[id] ||= new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', ...opts });
  return fmtCache[id].format(asDate(k));
}
export const fmtShort = (k) => fmt(k, { day: 'numeric', month: 'short' }).replace('.', '');
export const fmtLong = (k) => fmt(k, { weekday: 'long', day: 'numeric', month: 'long' });

export const BLEED = new Set(['light', 'medium', 'heavy']);
export const isBleed = (day) => BLEED.has(day?.flow);

export const DEFAULT_SETTINGS = { cycle: 28, period: 5, luteal: 14, lockMin: 1, hormonal: false, lastBackup: null };
export const emptyData = () => ({ v: 1, settings: { ...DEFAULT_SETTINGS }, days: {} });
export const normalize = (d) => ({ ...emptyData(), ...d, settings: { ...DEFAULT_SETTINGS, ...(d?.settings || {}) }, days: d?.days || {} });

// Días seguidos de sangrado (se permite un día sin apuntar en medio) = una regla.
export function periodsOf(days) {
  const out = [];
  for (const k of Object.keys(days).filter((k) => isBleed(days[k])).sort()) {
    const n = toNum(k);
    const last = out[out.length - 1];
    if (last && n - last.endN <= 2) {
      last.end = k;
      last.endN = n;
    } else out.push({ start: k, end: k, startN: n, endN: n });
  }
  return out.map((p) => ({ start: p.start, end: p.end, length: p.endN - p.startN + 1 }));
}

const plausible = (len) => len >= 15 && len <= 90;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

function quantile(sorted, q) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.min(lo + 1, sorted.length - 1)] - sorted[lo]) * (i - lo);
}

export function summarize(data, today) {
  const s = data.settings;
  const days = data.days;
  const periods = periodsOf(days);
  const cycles = periods.map((p, i) => {
    const next = periods[i + 1];
    return { start: p.start, periodLength: p.length, length: next ? diff(p.start, next.start) : null };
  });

  const last = periods[periods.length - 1] || null;
  // Sigue la regla si hoy hay sangrado, o si lo hubo ayer y hoy no se ha dicho que ya terminó.
  const ongoing = !!last && today >= last.start && (last.end >= today || (diff(last.end, today) === 1 && days[today]?.flow !== 'none'));

  const done = cycles.filter((c) => c.length != null && plausible(c.length));
  const recent = done.slice(-6);
  const avgCycle = recent.length ? Math.round(mean(recent.map((c) => c.length))) : s.cycle;
  const closed = periods.filter((p, i) => i < periods.length - 1 || !ongoing).slice(-6);
  const avgPeriod = Math.min(12, Math.max(1, closed.length ? Math.round(mean(closed.map((p) => p.length))) : s.period));
  const lengths = recent.map((c) => c.length);
  const minCycle = lengths.length ? Math.min(...lengths) : null;
  const maxCycle = lengths.length ? Math.max(...lengths) : null;

  let next = null;
  let late = 0;
  let cycleDay = null;
  let ovulation = null;
  const predicted = [];
  const fertile = [];

  if (last) {
    cycleDay = diff(last.start, today) + 1;
    next = addDays(last.start, avgCycle);
    if (!ongoing && diff(next, today) > 0) late = diff(next, today);

    // Ovulación del ciclo actual: un test positivo manda; si no, 14 días (fase lútea) antes de la siguiente.
    const lh = Object.keys(days)
      .filter((k) => k >= last.start && k <= today && days[k]?.lh === 'pos')
      .sort()[0];
    ovulation = lh ? addDays(lh, 1) : addDays(next, -s.luteal);

    // Si va con retraso, la siguiente puede llegar cualquier día: se pinta desde hoy.
    const first = late > 0 ? today : next;
    for (let i = 0; i < 12; i++) {
      const st = addDays(first, i * avgCycle);
      predicted.push({ start: st, end: addDays(st, avgPeriod - 1) });
    }
    if (!s.hormonal) {
      // Ventanas pasadas (estimadas a posteriori), la actual y las futuras.
      cycles.forEach((c) => c.length && plausible(c.length) && fertile.push(addDays(c.start, c.length - s.luteal)));
      fertile.push(ovulation);
      predicted.slice(1).forEach((p) => fertile.push(addDays(p.start, -s.luteal)));
    }
  }

  const windows = fertile.map((ov) => ({ ov, start: addDays(ov, -5), end: addDays(ov, 1) }));

  let phase = 'none';
  if (last) {
    if (ongoing) phase = 'period';
    else if (late > 0) phase = 'late';
    else if (next === today) phase = 'due';
    else if (s.hormonal) phase = 'cycle';
    else {
      const d = diff(ovulation, today);
      phase = d === 0 ? 'ovulation' : d >= -5 && d <= 1 ? 'fertile' : d < -5 ? 'follicular' : 'luteal';
    }
  }

  return {
    periods, cycles, last, ongoing, avgCycle, avgPeriod, minCycle, maxCycle,
    measured: recent.length, next, late, cycleDay, ovulation: s.hormonal ? null : ovulation,
    predicted, windows, phase,
    periodDay: ongoing ? diff(last.start, today) + 1 : null,
    daysToNext: next ? diff(today, next) : null,
    deviations: deviations(days, periods, done, today),
  };
}

// Mapa día -> marcas para el calendario.
export function marksFor(summary, days, today) {
  const m = {};
  const add = (k, flag) => ((m[k] ||= {})[flag] = true);
  for (const p of summary.periods) for (let k = p.start; k <= p.end; k = addDays(k, 1)) add(k, 'period');
  for (const p of summary.predicted) for (let k = p.start; k <= p.end; k = addDays(k, 1)) if (k >= today && !days[k]?.flow) add(k, 'predicted');
  for (const w of summary.windows) {
    for (let k = w.start; k <= w.end; k = addDays(k, 1)) add(k, 'fertile');
    add(w.ov, 'ovulation');
  }
  for (const [k, d] of Object.entries(days)) {
    if (d.flow === 'spot') add(k, 'spot');
    if (Object.keys(d).some((f) => f !== 'flow')) add(k, 'log');
  }
  return m;
}

// Avisos de los últimos 6 meses (definiciones de la FIGO).
function deviations(days, periods, done, today) {
  const from = addDays(today, -182);
  const out = [];
  const recentC = done.filter((c) => c.start >= from);
  if (recentC.length >= 3) {
    const L = recentC.map((c) => c.length);
    if (Math.max(...L) - Math.min(...L) >= 17) out.push('irregular');
  }
  const recentP = periods.filter((p) => p.start >= from);
  if (periods.length && periods[0].start <= from && recentP.length > 0 && recentP.length <= 2) out.push('infrequent');
  if (recentP.filter((p) => p.length >= 10).length >= 2) out.push('prolonged');
  const spotCycles = new Set();
  for (const [k, d] of Object.entries(days)) {
    if (d.flow !== 'spot' || k < from) continue;
    const owner = [...periods].reverse().find((p) => p.start <= k);
    if (owner && k > owner.end) spotCycles.add(owner.start);
  }
  if (spotCycles.size >= 2) out.push('spotting');
  return out;
}

// Qué síntomas se repiten y en qué días del ciclo suelen salir.
export function patterns(data, summary, field, today, min = 3) {
  const starts = summary.periods.map((p) => p.start);
  const from = addDays(today, -365);
  const count = {};
  for (const [k, d] of Object.entries(data.days)) {
    if (k < from || !Array.isArray(d[field])) continue;
    const st = [...starts].reverse().find((s) => s <= k);
    for (const id of d[field]) {
      (count[id] ||= []).push(st ? diff(st, k) + 1 : null);
    }
  }
  return Object.entries(count)
    .filter(([, v]) => v.length >= min)
    .map(([id, v]) => {
      const cd = v.filter((x) => x != null).sort((a, b) => a - b);
      const range = cd.length >= min ? [Math.round(quantile(cd, 0.25)), Math.round(quantile(cd, 0.75))] : null;
      return { id, times: v.length, range };
    })
    .sort((a, b) => b.times - a.times);
}

export const cycleDayOf = (summary, k) => {
  const st = [...summary.periods].reverse().find((p) => p.start <= k);
  return st ? diff(st.start, k) + 1 : null;
};
