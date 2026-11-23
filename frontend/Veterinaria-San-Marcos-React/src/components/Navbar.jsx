import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
  const { usuarioLogueado } = useContext(AppContext);
  const [modoOscuro, setModoOscuro] = useState(() => localStorage.getItem('tema') === 'oscuro');

  useEffect(() => {
    const tema = modoOscuro ? 'dark' : 'light';
    document.documentElement.dataset.theme = tema;
    document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('tema', modoOscuro ? 'oscuro' : 'claro');
  }, [modoOscuro]);

  const cerrarMenuMovil = () => {
    const menu = document.getElementById('menuPrincipal');
    if (menu && menu.classList.contains('show') && window.bootstrap?.Collapse) {
      window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenuMovil}>
            <i className="fa-solid fa-paw me-2"></i> Veterinaria San Marcos
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menuPrincipal"
            aria-controls="menuPrincipal"
            aria-expanded="false"
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="menuPrincipal">
            <ul className="navbar-nav ms-auto align-items-lg-center py-2 py-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/#inicio" onClick={cerrarMenuMovil}>Inicio</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#nosotros" onClick={cerrarMenuMovil}>Nosotros</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#servicios" onClick={cerrarMenuMovil}>Servicios</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#contacto" onClick={cerrarMenuMovil}>Contacto</a>
              </li>
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                {usuarioLogueado ? (
                  <button
                    type="button"
                    className="btn btn-warning w-100"
                    id="btnLogin"
                    data-bs-toggle="modal"
                    data-bs-target="#modalCuenta"
                    onClick={cerrarMenuMovil}
                  >
                    <i className="fa-solid fa-user me-1"></i> Mi cuenta
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-light w-100"
                    id="btnLogin"
                    data-bs-toggle="modal"
                    data-bs-target="#modalLogin"
                    onClick={cerrarMenuMovil}
                  >
                    Iniciar sesión
                  </button>
                )}
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button
                  type="button"
                  className="btn btn-outline-light w-100"
                  aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
                  aria-pressed={modoOscuro}
                  title={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
                  onClick={() => setModoOscuro((actual) => !actual)}
                >
                  <i className={`fa-solid ${modoOscuro ? 'fa-sun' : 'fa-moon'} me-2`} aria-hidden="true"></i>
                  {modoOscuro ? 'Modo claro' : 'Modo oscuro'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}