// Fechas como claves 'AAAA-MM-DD' y toda la lógica del ciclo.
//
// Motor (lo mismo que hacen Clue y Flo, según su documentación):
// · Medias con los últimos 6 ciclos; se descartan ciclos imposibles (<15 o >90 días)
//   y, con 4 o más, los que se salen mucho del resto (viajes, enfermedad).
// · Hasta tener 3 ciclos, la media se mezcla con lo puesto en Ajustes.
// · La siguiente regla se predice con esa media y un margen (±) según lo que varían tus ciclos.
// · La ovulación la fija, por orden: test positivo (LH); método sintotérmico (Sensiplan):
//   subida de temperatura (3 sobre 6, ignorando mediciones alteradas) cruzada con el pico
//   de flujo; una sola de las dos señales; o si no, calendario: regla − fase lútea.
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

// Señales de ovulación dentro de un ciclo [start, end], con las reglas de Sensiplan.
// Devuelve { ov, source, confidence, until } (until = último día fértil confirmado) o null.
const FERTILE_MUCUS = new Set(['eggwhite', 'watery']);
function detectOvulation(days, start, end) {
  const keys = Object.keys(days).filter((k) => k >= start && k <= end).sort();
  // 1. Test de ovulación positivo: se ovula al día siguiente
  const lh = keys.find((k) => days[k]?.lh === 'pos' && diff(start, k) >= 5);
  if (lh) return { ov: addDays(lh, 1), source: 'lh', confidence: 'high', until: addDays(lh, 3) };

  // 2. Temperatura: se ignoran las mediciones marcadas como alteradas (fiebre, alcohol, mal sueño).
  //    Regla 3 sobre 6: tres mediciones seguidas por encima del máximo de las seis anteriores,
  //    y la tercera al menos 0,2 °C por encima. Se ovula el día antes de la primera alta.
  const temps = keys.filter((k) => typeof days[k]?.temp === 'number' && !days[k].disturbed).map((k) => ({ k, t: days[k].temp }));
  let temp = null;
  for (let i = 6; i + 2 < temps.length; i++) {
    const base = Math.max(...temps.slice(i - 6, i).map((x) => x.t));
    const three = temps.slice(i, i + 3);
    if (three.every((x) => x.t > base) && three[2].t >= base + 0.2 && diff(start, three[0].k) >= 7 && diff(three[0].k, three[2].k) <= 3) {
      temp = { ov: addDays(three[0].k, -1), until: three[2].k };
      break;
    }
  }

  // 3. Flujo: el pico es el último día de clara de huevo o acuoso; se confirma cuando pasan
  //    tres días sin flujo fértil (y al menos uno de ellos apuntado con flujo menor).
  let mucus = null;
  const fertileDays = keys.filter((k) => FERTILE_MUCUS.has(days[k]?.mucus) && diff(start, k) >= 6);
  for (let i = fertileDays.length - 1; i >= 0; i--) {
    const peak = fertileDays[i];
    const after = [1, 2, 3].map((n) => addDays(peak, n));
    if (after.some((k) => FERTILE_MUCUS.has(days[k]?.mucus))) continue;
    if (after[2] > end) break;
    if (after.some((k) => days[k]?.mucus)) { mucus = { ov: peak, until: after[2] }; break; }
  }

  // Doble comprobación: si temperatura y flujo coinciden (±3 días) la ovulación es segura
  if (temp && mucus && Math.abs(diff(temp.ov, mucus.ov)) <= 3) {
    return { ov: temp.ov, source: 'sympto', confidence: 'high', until: temp.until > mucus.until ? temp.until : mucus.until };
  }
  if (temp) return { ov: temp.ov, source: 'bbt', confidence: 'medium', until: temp.until };
  if (mucus) return { ov: mucus.ov, source: 'mucus', confidence: 'medium', until: mucus.until };
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
      ovConfirmed: det?.ov || null, ovSource: det?.source || null, ovConfidence: det?.confidence || null, ovUntil: det?.until || null,
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

  // Acierto: cuánto se habría desviado la predicción en cada ciclo pasado (a partir del cuarto)
  const errors = [];
  for (let i = 3; i < done.length; i++) {
    const prev = done.slice(Math.max(0, i - 6), i).map((c) => c.length);
    errors.push(Math.abs(done[i].length - Math.round(mean(prev))));
  }
  const accuracy = errors.length ? { cycles: errors.length, error: Math.round((mean(errors)) * 10) / 10, within2: errors.filter((e) => e <= 2).length } : null;

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
  let ovConfidence = 'low';
  let ovUntil = null;
  const predicted = [];
  const fertile = [];

  if (last) {
    cycleDay = diff(last.start, today) + 1;
    next = addDays(last.start, avgCycle);
    const cur = cycles[cycles.length - 1];
    if (cur.ovConfirmed) {
      ovulation = cur.ovConfirmed;
      ovSource = cur.ovSource;
      ovConfidence = cur.ovConfidence;
      ovUntil = cur.ovUntil;
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
  const windows = fertile.map((ov) => ({ ov, start: addDays(ov, -7 - extra), end: ov === ovulation && ovUntil && ovUntil > addDays(ov, 2) ? ovUntil : addDays(ov, 2) }));

  let phase = 'none';
  if (last) {
    if (ongoing) phase = 'period';
    else if (late > 0) phase = 'late';
    else if (next === today) phase = 'due';
    else if (s.hormonal) phase = 'cycle';
    else {
      const d = diff(ovulation, today);
      const w = windows.find((x) => x.ov === ovulation);
      phase = d === 0 ? 'ovulation' : w && today >= w.start && today <= w.end ? 'fertile' : d < 0 ? 'follicular' : 'luteal';
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
    periods, cycles, last, ongoing, avgCycle, avgPeriod, minCycle, maxCycle, spread, luteal, lutealLearned: lutealObs.length >= 2, trend, accuracy,
    measured: n, next, nextRange: next ? [addDays(next, -spread), addDays(next, spread)] : null,
    late, cycleDay, ovulation: s.hormonal ? null : ovulation, ovSource: s.hormonal ? null : ovSource, ovConfidence: s.hormonal ? null : ovConfidence,
    predicted, windows, phase, chance,
    periodDay: ongoing ? diff(last.start, today) + 1 : null,
    daysToNext: next ? diff(today, next) : null,
    deviations: deviations(days, periods, done, today),
  };
  summary.pms = premenstrual(days, cycles);
  summary.flags = redFlags(days, periods, done, today, ongoing);
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

// Banderas rojas: motivos claros de consulta (criterios habituales en ginecología).
function redFlags(days, periods, done, today, ongoing) {
  const out = [];
  const last = periods[periods.length - 1];
  const from = addDays(today, -182);
  if (last && !ongoing && diff(last.start, today) >= 90) out.push('amenorrhea');
  const last3 = done.slice(-3).map((c) => c.length);
  if (last3.length === 3 && last3.every((l) => l < 21)) out.push('short3');
  if (last3.length === 3 && last3.every((l) => l > 35)) out.push('long3');
  if (periods.some((p) => p.start >= from && p.length >= 8)) out.push('longbleed');
  // Sangrado tras relaciones: manchado fuera de la regla el mismo día o el siguiente a relaciones, dos veces
  let postcoital = 0;
  for (const [k, d] of Object.entries(days)) {
    if (k < from || d.flow !== 'spot') continue;
    const inPeriod = periods.some((p) => k >= addDays(p.start, -1) && k <= addDays(p.end, 1));
    if (!inPeriod && (hadSex(d) || hadSex(days[addDays(k, -1)]))) postcoital++;
  }
  if (postcoital >= 2) out.push('postcoital');
  // Test de embarazo positivo y sangrado en las dos semanas siguientes
  for (const [k, d] of Object.entries(days)) {
    if (d.preg !== 'pos' || k < addDays(today, -60)) continue;
    for (let i = 0; i <= 14; i++) if (isBleed(days[addDays(k, i)])) { out.push('pregbleed'); break; }
    if (out.includes('pregbleed')) break;
  }
  return out;
}

// Síntomas premenstruales con los criterios diarios del DSM-5: síntomas en la semana antes de la
// regla que no aparecen en la semana después de ella. Dos ciclos seguidos con patrón = SPM;
// cinco síntomas o más con uno de ánimo, en dos ciclos = patrón compatible con TDPM.
const PMS_CORE = ['swings', 'sensitive', 'irritable', 'anxious', 'sad'];
const PMS_OTHER = ['unmotivated', 'fatigue', 'cravings', 'hunger', 'insomnia', 'breasts', 'bloating', 'headache', 'muscle'];
function premenstrual(days, cycles) {
  const dayItems = (k) => new Set([...(days[k]?.sym || []), ...(days[k]?.mood || [])]);
  const met = [];
  for (const c of cycles.filter((c) => c.length && c.length >= 15 && c.length <= 90).slice(-6)) {
    const next = addDays(c.start, c.length);
    const lutealDays = [...Array(7)].map((_, i) => addDays(next, -1 - i));
    const follDays = [...Array(7)].map((_, i) => addDays(c.start, c.periodLength + i));
    const logged = lutealDays.filter((k) => days[k]).length + follDays.filter((k) => days[k]).length;
    if (logged < 6) continue; // sin registro diario no se puede valorar
    const count = (list, id) => list.filter((k) => dayItems(k).has(id)).length;
    const core = PMS_CORE.filter((id) => count(lutealDays, id) >= 2 && count(follDays, id) === 0);
    const other = PMS_OTHER.filter((id) => count(lutealDays, id) >= 2 && count(follDays, id) === 0);
    if (core.length + other.length >= 1) met.push({ start: c.start, core, other, total: core.length + other.length });
  }
  const pmdd = met.filter((m) => m.core.length >= 1 && m.total >= 5);
  const pms = met.filter((m) => m.total >= 2);
  const items = [...new Set(met.flatMap((m) => [...m.core, ...m.other]))];
  return {
    level: pmdd.length >= 2 ? 'pmdd' : pms.length >= 2 ? 'pms' : 'none',
    cycles: met.length, evaluated: met.length > 0, items,
  };
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
  if (s.pms.evaluated) {
    rows.push({
      id: 'pms', title: 'Síntomas premenstruales',
      value: s.pms.level === 'pmdd' ? 'patrón intenso' : s.pms.level === 'pms' ? 'patrón de SPM' : 'leves o ninguno',
      state: s.pms.level === 'pmdd' ? 'bad' : s.pms.level === 'pms' ? 'warn' : 'ok',
      normal: 'Es normal notar algo la semana antes de la regla. Cuenta como SPM si los mismos síntomas vuelven cada ciclo y desaparecen con la regla.',
      text: s.pms.level === 'pmdd'
        ? 'En dos o más ciclos tienes cinco o más síntomas la semana antes de la regla, con cambios de ánimo, que desaparecen después. Es un patrón compatible con trastorno disfórico premenstrual (TDPM): llévaselo a tu ginecóloga, tiene tratamiento.'
        : 'Los mismos síntomas se repiten la semana antes de la regla en dos o más ciclos y desaparecen con ella. Si te limitan, coméntalo: hay opciones.',
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
