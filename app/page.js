import NavMenu from '../components/NavMenu';
import ScrollHero from '../components/ScrollHero';
import Sections from '../components/Sections';
import Stats from '../components/Stats';
import Outro from '../components/Outro';

export default function Home() {
  return (
    <main>
      <NavMenu />
      <ScrollHero />
      <Sections />
      <Stats />
      <Outro />
    </main>
  );
}
