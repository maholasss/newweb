import { Shell } from '@/components/ui';
import { About } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Sobre Mahola, creadora de contenido en Valencia',
  description: 'Mahola, creadora de contenido en Valencia desde 2019 y bailarina de formación. Más de 60 campañas con marcas de beauty, moda, perfume y lifestyle.',
  alternates: alternates('/sobre-mi', '/en/about', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/about"><About lang="es" /></Shell>;
}
