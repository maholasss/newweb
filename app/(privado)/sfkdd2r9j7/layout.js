import './app.css';

// App privada: su propio layout raíz, sin nada de la web pública, fuera de buscadores.
// Usa la letra del sistema (San Francisco en iPhone y Mac): no carga nada de fuera.
const BASE = '/sfkdd2r9j7';

export const metadata = {
  title: 'Luna',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: 'no-referrer',
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: 'Luna', statusBarStyle: 'default' },
  formatDetection: { telephone: false, email: false, address: false },
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function Layout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
