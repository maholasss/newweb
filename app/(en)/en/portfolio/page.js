import { Shell } from '@/components/ui';
import { Portfolio } from '@/components/pages';
import { alternates } from '@/lib/site';

export const metadata = {
  title: 'Mahola UGC portfolio: CeraVe, L’Oréal, SHEIN and more',
  description: 'UGC videos by Mahola for 25+ skincare, makeup, fragrance, haircare and fashion brands. Hover over each logo to see the work.',
  alternates: alternates('/portfolio', '/en/portfolio', 'en'),
};
export default function Page() {
  return <Shell lang="en" other="/portfolio"><Portfolio lang="en" /></Shell>;
}
