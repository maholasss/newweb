'use client';

import { useState } from 'react';

/* ============================================================
   NAV — menú hamburguesa de cristal (Guía Blush & Ladrillo)
   Fijo arriba a la derecha. Desktop: pastilla horizontal.
   Móvil: popover vertical. Edita ITEMS para cambiar enlaces.
   ============================================================ */

const BRAND = {
  white: '#FFFFFF',
  blush: '#F0DAD5',
  softPink: '#E8B4AC',
  dustyPink: '#C98F87',
  brick: '#B8574C',
  wine: '#3D2422',
};

const ITEMS = [
  { label: 'Inicio', type: 'top' },
  { label: 'Trabajo', type: 'anchor', target: 'trabajo' },
  { label: 'Cifras', type: 'anchor', target: 'stats' },
  { label: 'Links', type: 'link', target: '/links' },
  { label: 'Contacto', type: 'link', target: 'mailto:hola@maholas.com' },
];

const glass = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 6px 24px rgba(61,36,34,0.1)',
};

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  const go = (item) => {
    setOpen(false);
    if (item.type === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.type === 'anchor') {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = item.target;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 100 }}>
      <style>{`
        .mh-nav-items {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          position: absolute;
          top: 0;
          right: 62px;
          height: 52px;
          padding: 0 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .mh-nav-items {
            flex-direction: column;
            align-items: stretch;
            top: 62px;
            right: 0;
            height: auto;
            padding: 10px;
            border-radius: 20px;
            min-width: 190px;
          }
        }
      `}</style>

      {/* pastilla / popover */}
      {open && (
        <nav className="mh-nav-items" style={glass}>
          {ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              style={{
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 13.5,
                letterSpacing: '0.04em',
                color: item.label === 'Contacto' ? BRAND.brick : BRAND.wine,
                background: 'none',
                border: 'none',
                borderRadius: 999,
                padding: '10px 14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* botón hamburguesa */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        style={{
          ...glass,
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 20,
            height: 2,
            background: BRAND.wine,
            borderRadius: 2,
            transition: 'transform 0.25s',
            transform: open ? 'rotate(45deg) translateY(5px)' : 'none',
          }}
        />
        <span
          style={{
            width: 20,
            height: 2,
            background: BRAND.wine,
            borderRadius: 2,
            transition: 'opacity 0.2s',
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            width: 20,
            height: 2,
            background: BRAND.wine,
            borderRadius: 2,
            transition: 'transform 0.25s',
            transform: open ? 'rotate(-45deg) translateY(-5px)' : 'none',
          }}
        />
      </button>
    </div>
  );
}
