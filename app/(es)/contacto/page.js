import { Shell } from '@/components/ui';
import { Contact } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Contacto · Colaboraciones UGC con Mahola',
  description: 'Escribe a Mahola para colaboraciones, campañas UGC o contenido para anuncios en TikTok e Instagram.',
  alternates: alternates('/contacto', '/en/contact', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/contact"><Contact lang="es" /></Shell>;
}
