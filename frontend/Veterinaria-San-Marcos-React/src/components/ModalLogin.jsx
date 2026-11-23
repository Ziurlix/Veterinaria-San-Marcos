import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function ModalLogin() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const resultado = await login(correo, password);

    if (resultado.success) {
      setCorreo('');
      setPassword('');

      const modalEl = document.getElementById('modalLogin');
      const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      window.location.reload();
    } else {
      setError(resultado.msg);
    }
  };

  const handleRegistroClick = () => {
    const modalEl = document.getElementById('modalLogin');
    window.bootstrap?.Modal?.getInstance(modalEl)?.hide();
  };

  return (
    <div className="modal fade" id="modalLogin" tabIndex="-1" aria-labelledby="modalLoginLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="modalLoginLabel">
              <i className="fa-solid fa-user me-2"></i> Iniciar sesión
            </h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="correoLogin" className="form-label">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="correoLogin" 
                  placeholder="ejemplo@correo.cl"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="passwordLogin" className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="passwordLogin" 
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
            </form>
          </div>
          <div className="modal-footer justify-content-center">
            <p className="mb-0">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/registro" 
                className="text-decoration-none fw-bold" 
                style={{ color: '#1b5e4b' }}
                onClick={handleRegistroClick}
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}