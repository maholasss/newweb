// Copia en la nube de la caja fuerte, siempre cifrada: el servidor guarda un blob
// que no puede leer. La cuenta se identifica por un hash del usuario y se protege
// con un token sacado de la contraseña por otra ruta distinta a la clave de cifrado,
// así el token no sirve para descifrar nada.
const URL_SYNC = 'https://luna-sync.manjelier.workers.dev/v1/vault';
const te = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const norm = (u) => u.trim().toLowerCase();

async function credentials(user, pass) {
  const u = norm(user);
  const id = hex(await crypto.subtle.digest('SHA-256', te.encode('luna-id|' + u)));
  const material = await crypto.subtle.importKey('raw', te.encode(u + '\u0000' + pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: te.encode('luna-auth|' + u), iterations: 200000, hash: 'SHA-256' }, material, 256);
  return { id, token: hex(bits) };
}

let creds = null; // se calcula al entrar y se olvida al bloquear
export async function arm(user, pass) { creds = await credentials(user, pass); }
export function disarm() { creds = null; }
export const armed = () => !!creds;

const headers = () => ({ 'x-luna-id': creds.id, authorization: `Bearer ${creds.token}`, 'content-type': 'application/json' });

// Sube la copia cifrada. Devuelve 'ok', 'kept' (en la nube había una más nueva) o lanza.
export async function push(record) {
  if (!creds) return 'off';
  const r = await fetch(URL_SYNC, { method: 'PUT', headers: headers(), body: JSON.stringify(record) });
  if (r.status === 409) return 'kept';
  if (!r.ok) throw new Error('sync-' + r.status);
  return 'ok';
}

// Baja la copia de la nube para estas credenciales, o null si no hay.
export async function pull(user, pass) {
  const c = await credentials(user, pass);
  const r = await fetch(URL_SYNC, { headers: { 'x-luna-id': c.id, authorization: `Bearer ${c.token}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('sync-' + r.status);
  const { record } = await r.json();
  return record || null;
}
