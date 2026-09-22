import { Shell } from '@/components/ui';
import { Portfolio } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Portfolio UGC de Mahola: CeraVe, L’Oréal, SHEIN y más',
  description: 'Vídeos UGC de Mahola para más de 25 marcas de skincare, maquillaje, perfume, pelo y moda. Pasa el ratón por cada logo para ver el trabajo.',
  alternates: alternates('/portfolio', '/en/portfolio', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/portfolio"><Portfolio lang="es" /></Shell>;
}
