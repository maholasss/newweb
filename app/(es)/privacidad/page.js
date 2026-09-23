import { Shell } from '@/components/ui';
import { EMAIL, alternates } from '@/lib/site';

export const metadata = {
  title: 'Privacidad · Mahola',
  description: 'Qué datos recoge esta web, para qué y cómo pedir que se borren.',
  alternates: alternates('/privacidad', '/en/privacy', 'es'),
  robots: { index: false },
};

export default function Page() {
  return (
    <Shell lang="es" other="/en/privacy">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">Legal</p>
          <h1>Privacidad</h1>
        </header>
        <div className="prose" style={{ paddingBottom: 100 }}>
          <p><strong>Quién trata tus datos.</strong> Mahola, creadora de contenido, con contacto en {EMAIL}.</p>
          <p><strong>Qué datos y para qué.</strong> Los que escribes en el formulario de contacto: nombre, email, marca y mensaje. Se usan solo para responderte y, si sale adelante, para preparar el presupuesto y la colaboración. La base legal es tu consentimiento al enviar el formulario y, después, la relación comercial.</p>
          <p><strong>Cómo llegan.</strong> El formulario envía el mensaje al correo de Mahola a través del servicio FormSubmit, que actúa como encargado del tratamiento. No se guardan en ninguna base de datos de esta web.</p>
          <p><strong>Cuánto tiempo.</strong> Mientras dure la conversación o la colaboración y, después, el tiempo que exija la ley para facturas y contratos.</p>
          <p><strong>Con quién se comparten.</strong> Con nadie, salvo obligación legal.</p>
          <p><strong>Tus derechos.</strong> Puedes pedir acceso, corrección, borrado, limitación u oposición escribiendo a {EMAIL}. Si crees que algo no se ha hecho bien, puedes reclamar ante la Agencia Española de Protección de Datos.</p>
          <p><strong>Cookies.</strong> Esta web no usa cookies de seguimiento ni analítica. Solo guarda en tu navegador preferencias de uso que no salen de tu dispositivo.</p>
        </div>
      </div>
    </Shell>
  );
}
