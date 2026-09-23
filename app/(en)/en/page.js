import { Shell } from '@/components/ui';
import { Home } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola · UGC content creator in Valencia, Spain',
  description: 'UGC content creator based in Valencia, Spain. 60+ beauty, fashion and fragrance campaigns: ambassador for Lancôme and Mugler, SHEIN influencer. Spanish and English.',
  alternates: alternates('/', '/en', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/"><Home lang="en" /></Shell>;
}
