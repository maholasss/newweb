import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Mahola — Creadora UGC',
  description:
    'Mahola, creadora UGC y bailarina profesional. Contenido auténtico de beauty, fashion y travel: tu producto dentro de la vida real.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
