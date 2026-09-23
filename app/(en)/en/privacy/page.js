import { Shell } from '@/components/ui';
import { EMAIL, alternates } from '@/lib/site';

export const metadata = {
  title: 'Privacy · Mahola',
  description: 'What data this website collects, why, and how to have it deleted.',
  alternates: alternates('/privacidad', '/en/privacy', 'en'),
  robots: { index: false },
};

export default function Page() {
  return (
    <Shell lang="en" other="/privacidad">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">Legal</p>
          <h1>Privacy</h1>
        </header>
        <div className="prose" style={{ paddingBottom: 100 }}>
          <p><strong>Who processes your data.</strong> Mahola, content creator, reachable at {EMAIL}.</p>
          <p><strong>What data and why.</strong> What you type into the contact form: name, email, brand and message. It is used only to reply to you and, if things move forward, to prepare a quote and the collaboration. The legal basis is your consent when sending the form and, afterwards, the business relationship.</p>
          <p><strong>How it travels.</strong> The form sends the message to Mahola’s inbox through FormSubmit, which acts as a data processor. Nothing is stored in a database on this website.</p>
          <p><strong>For how long.</strong> While the conversation or collaboration lasts and, afterwards, for as long as the law requires for invoices and contracts.</p>
          <p><strong>Who it is shared with.</strong> Nobody, unless the law requires it.</p>
          <p><strong>Your rights.</strong> You can ask for access, correction, deletion, restriction or objection by writing to {EMAIL}. If you think something was mishandled, you can complain to the Spanish Data Protection Agency (AEPD).</p>
          <p><strong>Cookies.</strong> This website uses no tracking or analytics cookies. It only keeps usage preferences in your browser, which never leave your device.</p>
        </div>
      </div>
    </Shell>
  );
}
