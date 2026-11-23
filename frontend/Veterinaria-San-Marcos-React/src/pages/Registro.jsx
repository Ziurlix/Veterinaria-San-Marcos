import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../service/api';

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    terminos: false
  });

  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirmPass, setMostrarConfirmPass] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const campoMap = {
      nombreRegistro: 'nombre',
      correoRegistro: 'correo',
      telefonoRegistro: 'telefono',
      passwordRegistro: 'password',
      confirmPasswordRegistro: 'confirmPassword',
      terminosRegistro: 'terminos'
    };

    const nombreCampo = campoMap[id];
    if (!nombreCampo) return;

    setFormData((prev) => ({
      ...prev,
      [nombreCampo]: type === 'checkbox' ? checked : value
    }));

    if (errores[nombreCampo]) {
      setErrores((prev) => ({ ...prev, [nombreCampo]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'Ingresa tu nombre completo.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!/^\d{9,10}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = 'Ingresa un teléfono válido.';
    }

    if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!formData.confirmPassword.trim()) {
      nuevosErrores.confirmPassword = 'Debes confirmar tu contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!formData.terminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos y condiciones.';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErrorRegistro('');

    const erroresDetectados = validarFormulario();
    if (Object.keys(erroresDetectados).length > 0) {
      setErrores(erroresDetectados);
      return;
    }

    const nuevoUsuario = {
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono.trim(),
      password: formData.password
    };

    setEnviando(true);
    try {
      await registrarUsuario(nuevoUsuario);
      setMensajeExito('¡Cuenta creada correctamente! Redirigiendo...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setErrorRegistro(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
      setEnviando(false);
    }
  };

  return (
    <section className="registro-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="registro-card">
              <div className="text-center mb-4">
                <div className="registro-icon">🐾</div>
                <h1>Crear una cuenta</h1>
                <p>
                  Regístrate para solicitar citas y gestionar la atención de tus mascotas.
                </p>
              </div>

              {mensajeExito && (
                <div className="alert alert-success fw-bold text-center" role="alert">
                  {mensajeExito}
                </div>
              )}
              {errorRegistro && (
                <div className="alert alert-danger fw-bold text-center" role="alert">
                  {errorRegistro}
                </div>
              )}

              <form id="formRegistro" onSubmit={handleSubmit} noValidate>
                {/* Nombre */}
                <div className="mb-3">
                  <label htmlFor="nombreRegistro" className="form-label">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                    id="nombreRegistro"
                    placeholder="Ej: Juan Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                  {errores.nombre && (
                    <div className="invalid-feedback d-block" id="errorNombreRegistro">
                      {errores.nombre}
                    </div>
                  )}
                </div>

                {/* Correo */}
                <div className="mb-3">
                  <label htmlFor="correoRegistro" className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                    id="correoRegistro"
                    placeholder="ejemplo@correo.cl"
                    value={formData.correo}
                    onChange={handleChange}
                  />
                  {errores.correo && (
                    <div className="invalid-feedback d-block" id="errorCorreoRegistro">
                      {errores.correo}
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div className="mb-3">
                  <label htmlFor="telefonoRegistro" className="form-label">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                    id="telefonoRegistro"
                    placeholder="Ej: 912345678"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                  {errores.telefono && (
                    <div className="invalid-feedback d-block" id="errorTelefonoRegistro">
                      {errores.telefono}
                    </div>
                  )}
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="passwordRegistro">
                    Contraseña
                  </label>
                  <div className="input-group has-validation">
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                      id="passwordRegistro"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      className="btn btn-outline-secondary toggle-password"
                      type="button"
                      onClick={() => setMostrarPass((prev) => !prev)}
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      <i className={`fa-solid ${mostrarPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    {errores.password && (
                      <div className="invalid-feedback d-block" id="errorPasswordRegistro">
                        {errores.password}
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="confirmPasswordRegistro">
                    Confirmar contraseña
                  </label>
                  <div className="input-group has-validation">
                    <input
                      type={mostrarConfirmPass ? 'text' : 'password'}
                      className={`form-control ${errores.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPasswordRegistro"
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      className="btn btn-outline-secondary toggle-password"
                      type="button"
                      onClick={() => setMostrarConfirmPass((prev) => !prev)}
                      aria-label="Mostrar u ocultar confirmación de contraseña"
                    >
                      <i className={`fa-solid ${mostrarConfirmPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    {errores.confirmPassword && (
                      <div className="invalid-feedback d-block" id="errorConfirmPasswordRegistro">
                        {errores.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Términos */}
                <div className="form-check mb-4">
                  <input
                    className={`form-check-input ${errores.terminos ? 'is-invalid' : ''}`}
                    type="checkbox"
                    id="terminosRegistro"
                    checked={formData.terminos}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="terminosRegistro">
                    Acepto los términos y condiciones.
                  </label>
                  {errores.terminos && (
                    <div className="invalid-feedback d-block" id="errorTerminosRegistro">
                      {errores.terminos}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={enviando}
                >
                  Crear cuenta
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/" id="volverLogin">
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}