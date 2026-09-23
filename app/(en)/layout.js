import { Instrument_Serif, Inter } from 'next/font/google';
import '../globals.css';
import Reveal from '@/components/Reveal';
import Active from '@/components/Active';
import { SITE } from '@/lib/site';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE),
  openGraph: { siteName: 'Mahola', locale: 'en_GB', type: 'website', images: ['/fotos/foto-4.jpg'] },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <div className="progress" aria-hidden="true"><i /></div>
        <Reveal />
        <Active />
      </body>
    </html>
  );
}
