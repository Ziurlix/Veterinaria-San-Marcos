import React, { useState } from 'react';

export default function Navigation({ usuario, onLoginClick, onAccountClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#inicio" onClick={closeMenu}>
            🐾 Veterinaria San Marcos
          </a>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="menuPrincipal"
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="menuPrincipal">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              {['Inicio', 'Nosotros', 'Servicios', 'Ubicación', 'Contacto'].map((label) => (
                <li className="nav-item" key={label}>
                  <a className="nav-link" href={`#${label === 'Ubicación' ? 'ubicacion' : label.toLowerCase()}`} onClick={closeMenu}>{label}</a>
                </li>
              ))}
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                <button
                  type="button"
                  className={`btn ${usuario ? 'btn-warning' : 'btn-light'}`}
                  onClick={() => { closeMenu(); usuario ? onAccountClick() : onLoginClick(); }}
                >
                  {usuario ? '👤 Mi cuenta' : 'Iniciar sesión'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
