import { Shell } from '@/components/ui';
import { Home } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola · Creadora UGC de beauty, moda y lifestyle',
  description: 'Mahola, creadora de contenido UGC y bailarina profesional. Vídeos de skincare, maquillaje y moda para marcas como CeraVe, L’Oréal Paris o SHEIN.',
  alternates: alternates('/', '/en', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en"><Home lang="es" /></Shell>;
}
