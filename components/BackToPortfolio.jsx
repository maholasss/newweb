'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, T } from '@/lib/site';

// Botón flotante: vuelve al portfolio desde cualquier página que no sea el propio portfolio
export default function BackToPortfolio({ lang }) {
  const path = usePathname();
  const portfolio = ROUTES.portfolio[lang];
  if (path === portfolio || path === ROUTES.home[lang]) return null;
  return (
    <Link href={portfolio} className="back-fab">
      <span aria-hidden="true">←</span> {T[lang].backToPortfolio}
    </Link>
  );
}
