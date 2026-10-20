'use client';

import dynamic from 'next/dynamic';
import { Moon } from './icons';

// Todo pasa en el navegador: el HTML que sirve el servidor solo trae la luna de carga.
const App = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => (
    <div className="boot">
      <Moon size={72} />
    </div>
  ),
});

export default function Boot() {
  return <App />;
}
