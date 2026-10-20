/** @type {import('next').NextConfig} */

// App privada: fuera de buscadores, sin enviar la dirección a otras webs y sin poder conectarse
// a ningún servidor que no sea el propio (aunque alguien colara código, no podría sacar datos).
const PRIVATE = '/sfkdd2r9j7';
const dev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://luna-sync.manjelier.workers.dev${dev ? ' ws: wss:' : ''}`,
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');
const privateHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig = {
  async headers() {
    return [
      { source: PRIVATE, headers: privateHeaders },
      { source: `${PRIVATE}/:path*`, headers: privateHeaders },
      { source: `${PRIVATE}-sw.js`, headers: [...privateHeaders, { key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
};

export default nextConfig;
