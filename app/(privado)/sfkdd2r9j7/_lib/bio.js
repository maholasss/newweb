// Desbloqueo con Face ID / Touch ID (WebAuthn con el autenticador del propio móvil).
// No sustituye a la contraseña: protege la sesión recordada para que, si alguien coge el
// móvil desbloqueado, la app pida la cara o la huella antes de abrirse.
const KEY = 'luna:bio';
const rnd = () => crypto.getRandomValues(new Uint8Array(32));
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function available() {
  try {
    return !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    return false;
  }
}
export const enabled = () => {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
};
export function disable() {
  try { localStorage.removeItem(KEY); } catch {}
}

// Registra la cara o huella de este móvil. Pide la verificación una vez.
export async function enroll(user) {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: rnd(),
      rp: { name: 'Luna' },
      user: { id: new TextEncoder().encode('luna|' + user), name: user, displayName: 'Luna' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
      timeout: 60000,
    },
  });
  if (!cred) throw new Error('bio');
  localStorage.setItem(KEY, b64(cred.rawId));
  return true;
}

// Pide la cara o huella. Devuelve true si la verificación pasa.
export async function verify() {
  const id = localStorage.getItem(KEY);
  if (!id) return false;
  const a = await navigator.credentials.get({
    publicKey: { challenge: rnd(), allowCredentials: [{ type: 'public-key', id: unb64(id) }], userVerification: 'required', timeout: 60000 },
  });
  return !!a;
}
