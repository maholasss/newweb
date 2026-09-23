import { Shell } from '@/components/ui';
import { Portfolio } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Portfolio de Mahola: CeraVe, L’Oréal, SHEIN y más',
  description: 'Los vídeos UGC de Mahola para 28 marcas: CeraVe, L’Oréal Paris, SHEIN, Mugler, Lancôme, Vichy, Garnier, Huda Beauty y más. Toca una marca y se abren.',
  alternates: alternates('/portfolio', '/en/portfolio', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/portfolio"><Portfolio lang="es" /></Shell>;
}
