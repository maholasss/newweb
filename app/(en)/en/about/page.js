import { Shell } from '@/components/ui';
import { About } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'About Mahola, content creator and dancer',
  description: 'Mahola, a content creator in Valencia since 2019 and a dancer by training. More than 60 campaigns with beauty, fashion, fragrance and lifestyle brands.',
  alternates: alternates('/sobre-mi', '/en/about', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/sobre-mi"><About lang="en" /></Shell>;
}
