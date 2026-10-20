// Fechas como claves 'AAAA-MM-DD' y toda la lógica del ciclo.
//
// Motor (lo mismo que hacen Clue y Flo, según su documentación):
// · Medias con los últimos 6 ciclos; se descartan ciclos imposibles (<15 o >90 días)
//   y, con 4 o más, los que se salen mucho del resto (viajes, enfermedad).
// · Hasta tener 3 ciclos, la media se mezcla con lo puesto en Ajustes.
// · La siguiente regla se predice con esa media y un margen (±) según lo que varían tus ciclos.
// · La ovulación la fija, por orden: test positivo (LH), subida de temperatura basal
//   (regla 3 sobre 6), pico de flujo clara de huevo, o si no, calendario: regla − fase lútea.
// · La fase lútea (14 por defecto) se aprende de tus ciclos con ovulación confirmada.
// · Ventana fértil de 10 días (ovulación el octavo), más ancha si tus ciclos varían mucho.
// · Lo "normal" sigue los criterios de la FIGO (2018), los mismos que usa Salud de Apple.

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
export const SEX = new Set(['protected', 'unprotected', 'solo']);
export const hadSex = (day) => Array.isArray(day?.sex) && day.sex.some((x) => SEX.has(x));

// Rangos normales (FIGO 2018)
export const NORMAL = { cycle: [24, 38], period: [2, 8], variation: 9, luteal: [11, 17] };

export const DEFAULT_SETTINGS = { cycle: 28, period: 5, luteal: 14, lockMin: -1, hormonal: false, lastBackup: null, cloud: null };
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
  return out.map((p) => {
    let heavy = 0;
    for (let k = p.start; k <= p.end; k = addDays(k, 1)) if (days[k]?.flow === 'heavy') heavy++;
    return { start: p.start, end: p.end, length: p.endN - p.startN + 1, heavy };
  });
}

const plausible = (len) => len >= 15 && len <= 90;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sd = (a) => (a.length < 2 ? 0 : Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1)));

function quantile(sorted, q) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.min(lo + 1, sorted.length - 1)] - sorted[lo]) * (i - lo);
}

// Señales de ovulación dentro de un ciclo [start, end]. Devuelve { ov, source } o null.
function detectOvulation(days, start, end) {
  const keys = Object.keys(days).filter((k) => k >= start && k <= end).sort();
  // 1. Test de ovulación positivo: se ovula al día siguiente
  const lh = keys.find((k) => days[k]?.lh === 'pos' && diff(start, k) >= 5);
  if (lh) return { ov: addDays(lh, 1), source: 'lh' };
  // 2. Temperatura basal: tres días seguidos ≥ 0,2 °C por encima del máximo de los seis anteriores
  const temps = keys.filter((k) => typeof days[k]?.temp === 'number').map((k) => ({ k, t: days[k].temp }));
  for (let i = 6; i + 2 < temps.length; i++) {
    const base = Math.max(...temps.slice(i - 6, i).map((x) => x.t));
    if (temps[i].t >= base + 0.2 && temps[i + 1].t >= base + 0.2 && temps[i + 2].t >= base + 0.2 && diff(start, temps[i].k) >= 7) {
      return { ov: temps[i - 1].k, source: 'bbt' };
    }
  }
  // 3. Pico de flujo fértil: último día de clara de huevo o acuoso seguido de flujo no fértil
  const fertileMucus = new Set(['eggwhite', 'watery']);
  const mucus = keys.filter((k) => days[k]?.mucus);
  for (let i = mucus.length - 2; i >= 0; i--) {
    if (fertileMucus.has(days[mucus[i]].mucus) && !fertileMucus.has(days[mucus[i + 1]].mucus) && diff(start, mucus[i]) >= 7) {
      return { ov: mucus[i], source: 'mucus' };
    }
  }
  return null;
}

export function summarize(data, today) {
  const s = data.settings;
  const days = data.days;
  const periods = periodsOf(days);
  const cycles = periods.map((p, i) => {
    const next = periods[i + 1];
    const length = next ? diff(p.start, next.start) : null;
    const end = next ? addDays(next.start, -1) : today;
    const det = s.hormonal ? null : detectOvulation(days, p.start, end);
    return {
      start: p.start, periodLength: p.length, heavy: p.heavy, length,
      ovConfirmed: det?.ov || null, ovSource: det?.source || null,
      luteal: det && length ? length - diff(p.start, det.ov) : null,
    };
  });

  const last = periods[periods.length - 1] || null;
  // Sigue la regla si hoy hay sangrado, o si lo hubo ayer y hoy no se ha dicho que ya terminó.
  const ongoing = !!last && today >= last.start && (last.end >= today || (diff(last.end, today) === 1 && days[today]?.flow !== 'none'));

  const done = cycles.filter((c) => c.length != null && plausible(c.length));
  const recent = done.slice(-6);
  let used = recent.map((c) => c.length);
  // Con 4 ciclos o más, fuera los que se salen 10 días o más de la mediana (no son tu patrón)
  if (used.length >= 4) {
    const md = median(used);
    const kept = used.filter((x) => Math.abs(x - md) < 10);
    if (kept.length >= 3) used = kept;
  }
  const n = used.length;
  // Hasta 3 ciclos, la media real se mezcla con lo de Ajustes
  const avgCycle = n ? Math.round((Math.min(n, 3) * mean(used) + Math.max(0, 3 - n) * s.cycle) / 3) : s.cycle;
  const spread = n >= 3 ? Math.min(7, Math.round(sd(used))) : n >= 1 ? 2 : 3;

  const closed = periods.filter((p, i) => i < periods.length - 1 || !ongoing).slice(-6);
  const avgPeriod = Math.min(12, Math.max(1, closed.length ? Math.round(mean(closed.map((p) => p.length))) : s.period));
  const lengths = recent.map((c) => c.length);
  const minCycle = lengths.length ? Math.min(...lengths) : null;
  const maxCycle = lengths.length ? Math.max(...lengths) : null;

  // Fase lútea aprendida de los ciclos con ovulación confirmada
  const lutealObs = done.filter((c) => c.luteal != null && c.luteal >= 7 && c.luteal <= 20).slice(-6).map((c) => c.luteal);
  const luteal = lutealObs.length >= 2 ? Math.round(mean(lutealObs)) : s.luteal;

  // Tendencia: últimos 3 frente a los 3 anteriores
  let trend = null;
  if (done.length >= 6) {
    const a = median(done.slice(-3).map((c) => c.length));
    const b = median(done.slice(-6, -3).map((c) => c.length));
    trend = a - b >= 2 ? 'longer' : b - a >= 2 ? 'shorter' : 'stable';
  }

  let next = null;
  let late = 0;
  let cycleDay = null;
  let ovulation = null;
  let ovSource = null;
  const predicted = [];
  const fertile = [];

  if (last) {
    cycleDay = diff(last.start, today) + 1;
    next = addDays(last.start, avgCycle);
    const cur = cycles[cycles.length - 1];
    if (cur.ovConfirmed) {
      ovulation = cur.ovConfirmed;
      ovSource = cur.ovSource;
      // Con ovulación confirmada, la regla llega una fase lútea después (así lo ajusta Flo)
      if (!ongoing) next = addDays(ovulation, luteal);
    } else {
      ovulation = addDays(next, -luteal);
      ovSource = 'calendar';
    }
    if (!ongoing && diff(next, today) > 0) late = diff(next, today);

    // Si va con retraso, la siguiente puede llegar cualquier día: se pinta desde hoy.
    const first = late > 0 ? today : next;
    for (let i = 0; i < 12; i++) {
      const st = addDays(first, i * avgCycle);
      predicted.push({ start: st, end: addDays(st, avgPeriod - 1) });
    }
    if (!s.hormonal) {
      // Ventanas pasadas (confirmadas o estimadas a posteriori), la actual y las futuras.
      cycles.slice(0, -1).forEach((c) => c.length && plausible(c.length) && fertile.push(c.ovConfirmed || addDays(c.start, c.length - luteal)));
      fertile.push(ovulation);
      predicted.slice(1).forEach((p) => fertile.push(addDays(p.start, -luteal)));
    }
  }

  // Ventana fértil de 10 días con la ovulación el octavo (como Flo): 7 antes y 2 después.
  // Si los ciclos varían mucho, se abre por delante (Flo llega a 14 días).
  const extra = ovSource === 'calendar' ? Math.min(4, Math.max(0, spread - 3)) : 0;
  const windows = fertile.map((ov) => ({ ov, start: addDays(ov, -7 - extra), end: addDays(ov, 2) }));

  let phase = 'none';
  if (last) {
    if (ongoing) phase = 'period';
    else if (late > 0) phase = 'late';
    else if (next === today) phase = 'due';
    else if (s.hormonal) phase = 'cycle';
    else {
      const d = diff(ovulation, today);
      phase = d === 0 ? 'ovulation' : d >= -7 - extra && d <= 2 ? 'fertile' : d < 0 ? 'follicular' : 'luteal';
    }
  }

  // Probabilidad de embarazo hoy (Wilcox 1995: máxima los dos días antes de ovular y el mismo día)
  let chance = null;
  if (last && !s.hormonal) {
    const w = windows.find((x) => x.ov === ovulation);
    const d = diff(ovulation, today);
    chance = ongoing ? 'low' : d >= -2 && d <= 0 ? 'high' : w && today >= w.start && today <= w.end ? 'medium' : 'low';
  }

  const summary = {
    periods, cycles, last, ongoing, avgCycle, avgPeriod, minCycle, maxCycle, spread, luteal, lutealLearned: lutealObs.length >= 2, trend,
    measured: n, next, nextRange: next ? [addDays(next, -spread), addDays(next, spread)] : null,
    late, cycleDay, ovulation: s.hormonal ? null : ovulation, ovSource: s.hormonal ? null : ovSource,
    predicted, windows, phase, chance,
    periodDay: ongoing ? diff(last.start, today) + 1 : null,
    daysToNext: next ? diff(today, next) : null,
    deviations: deviations(days, periods, done, today),
  };
  summary.assessment = assess(summary, today);
  return summary;
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
    if (hadSex(d)) add(k, 'sex');
    if (Object.keys(d).some((f) => f !== 'flow' && f !== 'sex')) add(k, 'log');
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

// "Así está tu ciclo": cada medida frente a lo normal. state: 'ok' | 'warn' | 'bad' | null (sin datos).
function assess(s, today) {
  const rows = [];
  const span = s.minCycle != null ? s.maxCycle - s.minCycle : null;
  const recentP = s.periods.filter((p) => p.start >= addDays(today, -182));

  rows.push({
    id: 'cycle', title: 'Duración del ciclo',
    value: s.measured ? `${s.avgCycle} días` : null,
    state: !s.measured ? null : s.avgCycle >= NORMAL.cycle[0] && s.avgCycle <= NORMAL.cycle[1] ? 'ok' : s.avgCycle < 21 || s.avgCycle > 45 ? 'bad' : 'warn',
    normal: 'Lo normal es entre 24 y 38 días.',
    text: s.avgCycle < NORMAL.cycle[0] ? 'Tus ciclos son más cortos de lo habitual. Si se repite, coméntalo en tu próxima revisión.' : 'Tus ciclos son más largos de lo habitual. Si pasa a menudo, coméntalo en tu próxima revisión.',
  });
  rows.push({
    id: 'regular', title: 'Regularidad',
    value: s.measured >= 2 ? `varía ${span} ${span === 1 ? 'día' : 'días'}` : null,
    state: s.measured < 3 ? null : span <= NORMAL.variation ? 'ok' : span < 17 ? 'warn' : 'bad',
    normal: 'Es regular si entre el ciclo más corto y el más largo hay 9 días o menos.',
    text: span >= 17 ? 'Tus ciclos varían mucho entre sí. Es frecuente con estrés, viajes o cambios de peso, pero si dura más de 6 meses conviene consultarlo.' : 'Tus ciclos varían algo más de lo habitual. Suele ser puntual; sigue apuntando para ver si se estabiliza.',
  });
  rows.push({
    id: 'period', title: 'Duración de la regla',
    value: s.periods.length ? `${s.avgPeriod} días` : null,
    state: !s.periods.length ? null : s.avgPeriod >= NORMAL.period[0] && s.avgPeriod <= NORMAL.period[1] ? 'ok' : s.avgPeriod > 9 ? 'bad' : 'warn',
    normal: 'Lo normal es que dure entre 2 y 8 días.',
    text: s.avgPeriod > NORMAL.period[1] ? 'Tus reglas duran más de 8 días. Si además son abundantes, coméntalo con tu ginecóloga.' : 'Tus reglas son muy cortas. Si antes eran más largas, coméntalo en tu próxima revisión.',
  });
  const heavyP = recentP.filter((p) => p.heavy >= 3).length;
  rows.push({
    id: 'heavy', title: 'Cantidad',
    value: s.periods.length ? (heavyP ? `${heavyP} ${heavyP === 1 ? 'regla abundante' : 'reglas abundantes'}` : 'normal') : null,
    state: !s.periods.length ? null : heavyP >= 2 ? 'warn' : 'ok',
    normal: 'Es normal uno o dos días más fuertes. Tres o más días abundantes seguidos, o cambiar de compresa cada hora, es sangrado abundante.',
    text: 'En los últimos 6 meses has tenido varias reglas con 3 o más días abundantes. Puede bajar el hierro: coméntalo con tu ginecóloga.',
  });
  rows.push({
    id: 'spotting', title: 'Manchado entre reglas',
    value: s.periods.length ? (s.deviations.includes('spotting') ? 'repetido' : 'no') : null,
    state: !s.periods.length ? null : s.deviations.includes('spotting') ? 'warn' : 'ok',
    normal: 'Un manchado suelto alrededor de la ovulación puede ser normal.',
    text: 'Has manchado fuera de la regla en dos o más ciclos de los últimos 6 meses. Conviene comentarlo con tu ginecóloga.',
  });
  if (s.lutealLearned) {
    rows.push({
      id: 'luteal', title: 'Fase lútea',
      value: `${s.luteal} días`,
      state: s.luteal >= NORMAL.luteal[0] && s.luteal <= NORMAL.luteal[1] ? 'ok' : 'warn',
      normal: 'De la ovulación a la regla suelen pasar entre 11 y 17 días.',
      text: s.luteal < NORMAL.luteal[0] ? 'Tu fase lútea sale corta. Si buscas embarazo, es un dato útil para tu ginecóloga.' : 'Tu fase lútea sale larga: revisa que los tests de ovulación estén bien apuntados.',
    });
  }
  if (s.deviations.includes('infrequent')) {
    rows.push({ id: 'infrequent', title: 'Frecuencia', value: 'pocas reglas', state: 'bad', normal: 'Lo normal es una regla cada 24 a 38 días.', text: 'Solo una o dos reglas en los últimos 6 meses. Conviene consultarlo.' });
  }
  return rows;
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
