import { Shell } from '@/components/ui';
import { About } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'About Mahola, dancer and UGC content creator',
  description: 'Mahola is a professional dancer and UGC creator. Dance gives her the rhythm and ease on camera that keep people watching a short video to the end.',
  alternates: alternates('/sobre-mi', '/en/about', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/sobre-mi"><About lang="en" /></Shell>;
}
