import { Shell } from '@/components/ui';
import { Home } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola · Creadora de contenido UGC en Valencia',
  description: 'Creadora de contenido UGC en Valencia. Más de 60 campañas de beauty, moda y perfume: embajadora de Lancôme y Mugler, influencer de SHEIN. En español e inglés.',
  alternates: alternates('/', '/en', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en"><Home lang="es" /></Shell>;
}
