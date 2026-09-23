import { Shell } from '@/components/ui';
import { Contact } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Contact · UGC collaborations with Mahola',
  description: 'Get in touch with Mahola, a UGC creator in Valencia: timings, languages, quotes and how she works with brands.',
  alternates: alternates('/contacto', '/en/contact', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/contacto"><Contact lang="en" /></Shell>;
}
