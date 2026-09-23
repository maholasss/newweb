'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu({ items, lang, other, otherLabel }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className="mnav">
      <button type="button" className={`burger${open ? ' is-open' : ''}`} aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
        <i /><i />
      </button>
      {open && <div className="mscrim" onClick={() => setOpen(false)} />}
      {open && (
        <nav className="msheet">
          {items.map(([href, label], i) => (
            <Link key={href} href={href} style={{ '--i': i }} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link className="msheet-lang" href={other} hrefLang={lang === 'es' ? 'en' : 'es'} style={{ '--i': items.length }} onClick={() => setOpen(false)}>{otherLabel}</Link>
        </nav>
      )}
    </div>
  );
}
