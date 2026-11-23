import { useState, useContext, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const extraerMontoCLP = (servicioTexto = '') => {
  const match = servicioTexto.match(/\$\s*([\d.]+)/);
  if (match && match[1]) {
    const limpio = Number(match[1].replace(/\./g, ''));
    if (!Number.isNaN(limpio) && limpio > 0) return limpio;
  }
  return 15000;
};

export default function Pago() {
  const { citas } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  const idCita = searchParams.get('id');
  const cita = useMemo(
    () => citas.find((c) => String(c.id) === String(idCita)),
    [citas, idCita]
  );

  const monto = useMemo(() => extraerMontoCLP(cita?.servicio), [cita]);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const handlePagar = async (e) => {
    e.preventDefault();
    if (!cita) return;

    setError('');
    setProcesando(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/pagos/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ idCita: cita.id })
      });

      const data = await res.json();
      if (!res.ok || !data.url || !data.token) {
        throw new Error(data.mensaje || 'No se pudo iniciar el pago con Transbank.');
      }

      sessionStorage.setItem('citaPendientePago', String(cita.id));
      const formularioTransbank = document.createElement('form');
      formularioTransbank.method = 'POST';
      formularioTransbank.action = data.url;
      formularioTransbank.hidden = true;

      const campoToken = document.createElement('input');
      campoToken.type = 'hidden';
      campoToken.name = 'token_ws';
      campoToken.value = data.token;
      formularioTransbank.appendChild(campoToken);
      document.body.appendChild(formularioTransbank);
      formularioTransbank.submit();
    } catch (err) {
      sessionStorage.removeItem('citaPendientePago');
      setError(err.message || 'No se pudo conectar con Transbank.');
    } finally {
      setProcesando(false);
    }
  };

  if (!cita) {
    return (
      <section className="py-5 my-4">
        <div className="container">
          <div className="alert alert-warning text-center">
            <h2 className="h5 mb-2">Cita no encontrada</h2>
            <p className="mb-3">No se encontró una cita válida para procesar el pago.</p>
            <Link to="/" className="btn btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 my-4">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {/* Columna izquierda: detalle del cobro */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <span className="badge bg-success-subtle text-success mb-2">
                  Webpay Plus · Ambiente de integración
                </span>
                <h1 className="h5 fw-bold mb-3">Detalle de la atención</h1>

                <div className="border-bottom pb-2 mb-2 small">
                  <div className="text-muted">Paciente</div>
                  <strong>{cita.mascota}</strong> ({cita.tipoMascota})
                </div>
                <div className="border-bottom pb-2 mb-2 small">
                  <div className="text-muted">Servicio</div>
                  <strong>{cita.servicio}</strong>
                </div>
                <div className="border-bottom pb-3 mb-3 small">
                  <div className="text-muted">Fecha y hora</div>
                  <strong>{cita.fecha} · {cita.hora} hrs</strong>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Total a pagar</span>
                  <span className="fs-4 fw-bold text-success">
                    ${monto.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: inicio del pago en Transbank */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">
                  <i className="fa-solid fa-lock me-2 text-success"></i>
                  Pago seguro con Transbank
                </h2>

                {error && (
                  <div className="alert alert-danger small py-2" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="alert alert-info small" role="status">
                  Serás redirigido al sitio de Transbank para completar la prueba en ambiente de integración.
                  No se realizará un cargo real y la aplicación no recibirá los datos de tu tarjeta.
                </div>

                <form onSubmit={handlePagar}>
                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100"
                    disabled={procesando}
                  >
                    {procesando
                      ? 'Conectando con Transbank...'
                      : `Continuar a Transbank · $${monto.toLocaleString('es-CL')} CLP`}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <Link to="/" className="text-decoration-none text-muted small">
                    ← Volver al inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}