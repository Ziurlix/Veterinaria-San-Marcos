import React, { useState } from 'react';
import ModalShell from './ModalShell';

export const validateRegistration = (values) => {
  const errors = {};
  const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\d{9,10}$/;

  if (!values.nombre.trim()) errors.nombre = 'Ingresa tu nombre completo.';
  else if (!namePattern.test(values.nombre.trim())) errors.nombre = 'El nombre solo puede contener letras.';
  if (!emailPattern.test(values.correo.trim())) errors.correo = 'Ingresa un correo electrónico válido.';
  if (!phonePattern.test(values.telefono.trim())) errors.telefono = 'Ingresa un teléfono válido (9 o 10 dígitos).';
  if (values.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  if (!values.confirmPassword) errors.confirmPassword = 'Debes confirmar tu contraseña.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
  if (!values.terminos) errors.terminos = 'Debes aceptar los términos y condiciones.';
  return errors;
};

const initialValues = { nombre: '', correo: '', telefono: '', password: '', confirmPassword: '', terminos: false };

export default function RegistrationForm({ show, onClose, onRegister }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateRegistration(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    onRegister({
      nombre: values.nombre.trim(),
      correo: values.correo.trim().toLowerCase(),
      telefono: values.telefono.trim(),
      password: values.password
    });
    setValues(initialValues);
    setErrors({});
  };

  const field = (id, label, type, placeholder, autoComplete) => (
    <div className="mb-3" key={id}>
      <label className="form-label" htmlFor={`registro-${id}`}>{label}</label>
      <input
        id={`registro-${id}`}
        className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={values[id]}
        onChange={(event) => update(id, event.target.value)}
        aria-invalid={Boolean(errors[id])}
      />
      {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
    </div>
  );

  return (
    <ModalShell show={show} onClose={onClose} title="🐾 Crear una cuenta">
      <form onSubmit={handleSubmit} noValidate>
        {field('nombre', 'Nombre completo', 'text', 'Ej: Juan Pérez', 'name')}
        {field('correo', 'Correo electrónico', 'email', 'ejemplo@correo.cl', 'email')}
        {field('telefono', 'Número de teléfono', 'tel', 'Ej: 912345678', 'tel')}
        {field('password', 'Contraseña', 'password', 'Mínimo 6 caracteres', 'new-password')}
        {field('confirmPassword', 'Confirmar contraseña', 'password', 'Repite tu contraseña', 'new-password')}
        <div className="form-check mb-4">
          <input
            id="registro-terminos"
            className={`form-check-input ${errors.terminos ? 'is-invalid' : ''}`}
            type="checkbox"
            checked={values.terminos}
            onChange={(event) => update('terminos', event.target.checked)}
          />
          <label className="form-check-label" htmlFor="registro-terminos">Acepto los términos y condiciones.</label>
          {errors.terminos && <div className="invalid-feedback d-block">{errors.terminos}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100">Crear cuenta</button>
      </form>
    </ModalShell>
  );
}
