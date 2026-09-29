'use client';
import { useState } from 'react';
import Link from 'next/link';
import { EMAIL, T } from '@/lib/site';

// Envía desde la web (FormSubmit) y, si algo falla, abre el correo con el mensaje escrito
export default function ContactForm({ lang }) {
  const f = T[lang].form;
  const [state, setState] = useState('idle'); // idle | sending | sent | error

  const mailto = (d) => {
    const subject = `${lang === 'en' ? 'Collaboration' : 'Colaboración'} · ${d.get('brand') || d.get('name')}`;
    const body = `${d.get('msg')}\n\n${[d.get('sector'), d.get('goal'), d.get('when'), d.get('budget')].filter(Boolean).join(' · ')}\n\n${d.get('name')}${d.get('brand') ? ` · ${d.get('brand')}` : ''}\n${d.get('email') || ''}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const send = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setState('sending');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `${lang === 'en' ? 'New enquiry from the website' : 'Nueva consulta desde la web'} · ${d.get('brand') || d.get('name')}`,
          nombre: d.get('name'),
          marca: d.get('brand'),
          email: d.get('email'),
          sector: d.get('sector'),
          objetivo: d.get('goal'),
          plazo: d.get('when'),
          presupuesto: d.get('budget'),
          mensaje: d.get('msg'),
        }),
      });
      if (!res.ok) throw new Error('bad');
      setState('sent');
      form.reset();
    } catch (err) {
      setState('error');
      mailto(d);
    }
  };

  if (state === 'sent') {
    return (
      <div className="form form--sent">
        <p className="form-ok">{f.ok}</p>
        <p>{f.okSub}</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={send}>
      <label><span>{f.name}</span><input name="name" autoComplete="name" required /></label>
      <label><span>{f.email}</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>{f.brand} <em>({f.optional})</em></span><input name="brand" autoComplete="organization" /></label>
      <div className="form-row">
        <label><span>{f.sector}</span><select name="sector" defaultValue="">{[''].concat(f.sectors).map((o) => <option key={o} value={o}>{o || '…'}</option>)}</select></label>
        <label><span>{f.goal}</span><select name="goal" defaultValue="">{[''].concat(f.goals).map((o) => <option key={o} value={o}>{o || '…'}</option>)}</select></label>
      </div>
      <div className="form-row">
        <label><span>{f.when}</span><select name="when" defaultValue="">{[''].concat(f.whens).map((o) => <option key={o} value={o}>{o || '…'}</option>)}</select></label>
        <label><span>{f.budget}</span><select name="budget" defaultValue="">{[''].concat(f.budgets).map((o) => <option key={o} value={o}>{o || '…'}</option>)}</select></label>
      </div>
      <label><span>{f.msg}</span><textarea name="msg" placeholder={f.msgHint} required /></label>
      <button type="submit" className="btn btn--dark" disabled={state === 'sending'}>
        <span>{state === 'sending' ? f.sending : f.send}</span>
      </button>
      <small>{state === 'error' ? f.errorNote : f.note}</small>
      <small>{f.privacy} <Link href={lang === 'en' ? '/en/privacy' : '/privacidad'}>{f.privacyLink}</Link></small>
    </form>
  );
}
