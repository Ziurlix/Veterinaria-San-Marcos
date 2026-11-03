import React, { useState } from 'react';
import ModalShell from './ModalShell';

export default function LoginForm({ show, onClose, onLogin, onOpenRegister, notice = '' }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password.trim()) {
      setError('La contraseña es obligatoria.');
      return;
    }
    const result = onLogin(correo.trim().toLowerCase(), password);
    if (!result) setError('Credenciales incorrectas o no existe una cuenta registrada.');
  };

  return (
    <ModalShell show={show} onClose={onClose} title="🐾 Iniciar sesión">
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-correo">Correo electrónico</label>
          <input id="login-correo" className="form-control" type="email" placeholder="ejemplo@correo.cl" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-password">Contraseña</label>
          <input id="login-password" className="form-control" type="password" placeholder="Ingresa tu contraseña" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
      </form>
      <div className="text-center mt-4">
        <p className="mb-0">¿No tienes una cuenta?{' '}
          <button type="button" className="btn btn-link p-0 fw-bold text-decoration-none" onClick={onOpenRegister}>Regístrate</button>
        </p>
      </div>
    </ModalShell>
  );
}
