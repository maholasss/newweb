'use client';
import { EMAIL, T } from '@/lib/site';

// Sin backend: abre el correo con el mensaje ya escrito
export default function ContactForm({ lang }) {
  const f = T[lang].form;
  const send = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const subject = `${lang === 'en' ? 'Collaboration' : 'Colaboración'} · ${d.get('brand') || d.get('name')}`;
    const body = `${d.get('msg')}\n\n${d.get('name')}${d.get('brand') ? ` · ${d.get('brand')}` : ''}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <form className="form" onSubmit={send}>
      <input name="name" placeholder={f.name} aria-label={f.name} required />
      <input name="brand" placeholder={f.brand} aria-label={f.brand} />
      <textarea name="msg" placeholder={f.msg} aria-label={f.msg} required />
      <button type="submit" className="btn btn--dark"><span>{f.send}</span></button>
      <small>{f.note}</small>
    </form>
  );
}
