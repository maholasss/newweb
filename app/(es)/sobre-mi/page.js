import { Shell } from '@/components/ui';
import { About } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Sobre Mahola, bailarina y creadora de contenido UGC',
  description: 'Mahola es bailarina profesional y creadora UGC. Del baile trae el ritmo y la soltura delante de la cámara que hacen que un vídeo corto se vea hasta el final.',
  alternates: alternates('/sobre-mi', '/en/about', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/about"><About lang="es" /></Shell>;
}
