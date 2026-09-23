import { Shell } from '@/components/ui';
import { Portfolio } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola UGC portfolio: CeraVe, L’Oréal, SHEIN and more',
  description: 'Mahola’s UGC videos for 28 brands: CeraVe, L’Oréal Paris, SHEIN, Mugler, Lancôme, Vichy, Garnier, Huda Beauty and more. Tap a brand to open them.',
  alternates: alternates('/portfolio', '/en/portfolio', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/portfolio"><Portfolio lang="en" /></Shell>;
}
