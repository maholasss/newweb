import { Shell } from '@/components/ui';
import { About } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Sobre Mahola, creadora de contenido en Valencia',
  description: 'Mahola es creadora de contenido UGC y bailarina profesional. Del baile trae el ritmo y la soltura delante de la cámara que hacen que un vídeo corto se vea hasta el final.',
  alternates: alternates('/sobre-mi', '/en/about', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/about"><About lang="es" /></Shell>;
}
