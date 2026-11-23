import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function ModalCuenta() {
  const { usuarioActual, logout } = useContext(AppContext);

  const handleCerrarSesion = () => {
    logout();
    const modalEl = document.getElementById('modalCuenta');
    const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
    if (modalInstance) {
      modalInstance.hide();
    }
  };

  return (
    <div
      className="modal fade"
      id="modalCuenta"
      tabIndex="-1"
      aria-labelledby="modalCuentaLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="modalCuentaLabel">
              <i className="fa-solid fa-address-card me-2"></i> Mi cuenta
            </h2>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            <div className="cuenta-dato">
              <strong>Nombre:</strong>
              <span>{usuarioActual?.nombre || '-'}</span>
            </div>
            <div className="cuenta-dato">
              <strong>Correo:</strong>
              <span>{usuarioActual?.correo || '-'}</span>
            </div>
            <div className="cuenta-dato">
              <strong>Teléfono:</strong>
              <span>{usuarioActual?.telefono || '-'}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              id="btnMisCitas"
              data-bs-toggle="modal"
              data-bs-target="#modalMisCitas"
            >
              <i className="fa-solid fa-list-check me-2"></i> Mis citas
            </button>
            <button
              type="button"
              className="btn btn-danger"
              id="btnCerrarSesion"
              onClick={handleCerrarSesion}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}