import Link from 'next/link';

const ES = (
  <svg viewBox="0 0 3 2" aria-hidden="true">
    <rect width="3" height="2" fill="#c60b1e" />
    <rect y="0.5" width="3" height="1" fill="#ffc400" />
  </svg>
);

const UK = (
  <svg viewBox="0 0 60 30" aria-hidden="true">
    <rect width="60" height="30" fill="#012169" />
    <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
    <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

// Dos banderas: la del idioma en el que estás queda marcada
export default function LangSwitch({ lang, other }) {
  const flags = [
    ['es', ES, 'Español'],
    ['en', UK, 'English'],
  ];
  return (
    <span className="langs">
      {flags.map(([code, flag, label]) =>
        code === lang ? (
          <span key={code} className="flag is-on" aria-current="true" title={label}>{flag}</span>
        ) : (
          <Link key={code} href={other} className="flag" hrefLang={code} aria-label={label} title={label}>{flag}</Link>
        )
      )}
    </span>
  );
}
