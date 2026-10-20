// Diario cifrado que vive solo en este dispositivo.
// La clave sale de usuario + contraseña con PBKDF2 (600.000 vueltas) y cifra con AES-GCM.
// La contraseña no se guarda en ningún sitio: si descifra, es la buena.

const STORE = 'luna:v1';
const PREV = 'luna:v1:prev';
const ITER = 600000;
const AAD = new TextEncoder().encode('luna:v1');
const te = new TextEncoder();
const td = new TextDecoder();
import { push, armed } from './sync';

export function toB64(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
export const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const normUser = (u) => u.trim().toLowerCase();

async function derive(user, pass, salt, iter) {
  const material = await crypto.subtle.importKey('raw', te.encode(normUser(user) + '\u0000' + pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function isRecord(r) {
  return !!r && r.app === 'luna' && r.v === 1 && r.kdf?.salt && r.kdf?.iter > 0 && typeof r.iv === 'string' && typeof r.ct === 'string';
}

export function readVault() {
  try {
    const raw = localStorage.getItem(STORE);
    const r = raw ? JSON.parse(raw) : null;
    return isRecord(r) ? r : null;
  } catch {
    return null;
  }
}

function write(record) {
  const cur = localStorage.getItem(STORE);
  if (cur) localStorage.setItem(PREV, cur);
  localStorage.setItem(STORE, JSON.stringify(record));
}

export async function seal(session, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, session.key, te.encode(JSON.stringify(data)));
  return { app: 'luna', v: 1, kdf: session.kdf, iv: toB64(iv), ct: toB64(ct), at: Date.now() };
}

export async function save(session, data) {
  const record = await seal(session, data);
  write(record);
  // La nube va después y nunca bloquea: si falla, el dato ya está a salvo en el móvil
  if (armed() && data?.settings?.cloud === true) push(record).catch(() => {});
}

// Devuelve { session, data } o lanza si usuario/contraseña no son los de esta copia.
export async function unlock(user, pass, record = readVault()) {
  if (!isRecord(record)) throw new Error('sin-datos');
  const key = await derive(user, pass, fromB64(record.kdf.salt), record.kdf.iter);
  let plain;
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(record.iv), additionalData: AAD }, key, fromB64(record.ct));
  } catch {
    throw new Error('credenciales');
  }
  return { session: { key, kdf: record.kdf }, data: JSON.parse(td.decode(plain)) };
}

export async function create(user, pass, data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kdf = { name: 'PBKDF2-SHA256', iter: ITER, salt: toB64(salt) };
  const session = { key: await derive(user, pass, salt, ITER), kdf };
  await save(session, data);
  return session;
}

// Restaura una copia ya comprobada: la deja como diario de este dispositivo.
export function adopt(record) {
  write(record);
}

export function wipe() {
  localStorage.removeItem(STORE);
  localStorage.removeItem(PREV);
}

export function askPersistence() {
  try {
    navigator.storage?.persist?.();
  } catch {}
}

// Sesión recordada: la clave de cifrado (que el navegador no deja extraer) y el
// acceso a la nube se guardan en IndexedDB durante 7 días, así no pide la
// contraseña cada vez. Bloquear la app los borra.
const SESSION_DAYS = 7;
function idb() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open('luna-session', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('s');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function idbPut(v) {
  const db = await idb();
  await new Promise((ok, ko) => { const t = db.transaction('s', 'readwrite'); t.objectStore('s').put(v, 'cur'); t.oncomplete = ok; t.onerror = () => ko(t.error); });
  db.close();
}
async function idbGet() {
  const db = await idb();
  const v = await new Promise((ok, ko) => { const r = db.transaction('s').objectStore('s').get('cur'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
  db.close();
  return v;
}
export async function rememberSession(session, cloud, days = SESSION_DAYS) {
  try { await idbPut({ key: session.key, kdf: session.kdf, cloud, exp: Date.now() + days * 86400000 }); } catch {}
}
export async function forgetSession() {
  try { await idbPut(null); } catch {}
}
// Devuelve { session, data, cloud } si hay sesión viva y la copia local abre con ella.
export async function resumeSession() {
  try {
    const s = await idbGet();
    if (!s || !s.key || s.exp < Date.now()) return null;
    const record = readVault();
    if (!record) return null;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(record.iv), additionalData: AAD }, s.key, fromB64(record.ct));
    return { session: { key: s.key, kdf: s.kdf }, data: JSON.parse(td.decode(plain)), cloud: s.cloud || null };
  } catch {
    return null;
  }
}
