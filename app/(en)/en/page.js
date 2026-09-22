import { Shell } from '@/components/ui';
import { Home } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola · UGC creator for beauty, fashion & lifestyle',
  description: 'Mahola is a UGC content creator and professional dancer. Skincare, makeup and fashion videos for brands like CeraVe, L’Oréal Paris and SHEIN.',
  alternates: alternates('/', '/en', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/"><Home lang="en" /></Shell>;
}
