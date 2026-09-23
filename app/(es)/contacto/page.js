import { Shell } from '@/components/ui';
import { Contact } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Contacto · Colaboraciones con Mahola',
  description: 'Escribe a Mahola, creadora UGC en Valencia: plazos, idiomas, presupuesto y cómo trabaja con las marcas.',
  alternates: alternates('/contacto', '/en/contact', 'es'),
};
export default function Page() {
  return <Shell lang="es" other="/en/contact"><Contact lang="es" /></Shell>;
}
