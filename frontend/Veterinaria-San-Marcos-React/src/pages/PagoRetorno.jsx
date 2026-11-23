import { useEffect, useRef, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function PagoRetorno() {
  const { confirmarPagoCita } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const tokenWs = searchParams.get('token_ws') || searchParams.get('TBK_TOKEN');
  const pagoAnulado = !tokenWs || Boolean(searchParams.get('TBK_TOKEN'));
  const [estado, setEstado] = useState('verificando');
  const [codigoTx, setCodigoTx] = useState('');
  const [mensaje, setMensaje] = useState('Confirmando transacción con Transbank...');
  const confirmacionRef = useRef(null);
  const estadoActual = pagoAnulado ? 'error' : estado;
  const mensajeActual = pagoAnulado
    ? 'El pago fue anulado o no se recibió un token válido de Webpay.'
    : mensaje;

  useEffect(() => {
    const idCita = searchParams.get('idCita') || sessionStorage.getItem('citaPendientePago');

    if (pagoAnulado) {
      sessionStorage.removeItem('citaPendientePago');
      return;
    }

    let activo = true;
    const confirmarEnBackend = async (tokenTransbank) => {
      const tokenJwt = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/pagos/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokenJwt ? { Authorization: `Bearer ${tokenJwt}` } : {})
        },
        body: JSON.stringify({ tokenWs: tokenTransbank })
      });

      const data = await res.json();
      if (!res.ok || !data.aprobado) {
        throw new Error(data.mensaje || 'Transacción rechazada');
      }
      return data;
    };

    if (confirmacionRef.current?.token !== tokenWs) {
      confirmacionRef.current = {
        token: tokenWs,
        promise: confirmarEnBackend(tokenWs)
      };
    }

    confirmacionRef.current.promise
      .then((data) => {
        sessionStorage.removeItem('citaPendientePago');
        if (!activo) return;

        const tx = data.authorizationCode || data.buyOrder;
        const idCitaConfirmada = data.idCita || idCita;
        if (idCitaConfirmada) confirmarPagoCita(idCitaConfirmada, tx);
        setCodigoTx(tx);
        setEstado('exito');
        setMensaje('Tu pago fue autorizado y la cita quedó marcada como pagada.');
      })
      .catch((err) => {
        sessionStorage.removeItem('citaPendientePago');
        if (!activo) return;
        setEstado('error');
        setMensaje(err.message || 'No se pudo confirmar la transacción.');
      });

    return () => {
      activo = false;
    };
  }, [searchParams, pagoAnulado, tokenWs, confirmarPagoCita]);

  return (
    <section className="py-5 my-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card shadow-sm border-0 text-center p-4">
              {estadoActual === 'verificando' && (
                <>
                  <div className="spinner-border text-success mx-auto mb-3" role="status"></div>
                  <h1 className="h5 fw-bold">Procesando respuesta</h1>
                  <p className="text-muted mb-0">{mensajeActual}</p>
                </>
              )}

              {estadoActual === 'exito' && (
                <>
                  <div className="fs-1 text-success mb-2">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h1 className="h4 fw-bold mb-2">Pago aprobado</h1>
                  <p className="text-muted mb-3">{mensajeActual}</p>
                  {codigoTx && (
                    <div className="bg-light border rounded p-2 mb-4 small">
                      Código de transacción: <strong>{codigoTx}</strong>
                    </div>
                  )}
                  <Link to="/" className="btn btn-primary w-100">
                    Volver al inicio
                  </Link>
                </>
              )}

              {estadoActual === 'error' && (
                <>
                  <div className="fs-1 text-danger mb-2">
                    <i className="fa-solid fa-circle-xmark"></i>
                  </div>
                  <h1 className="h4 fw-bold mb-2">Pago no completado</h1>
                  <p className="text-muted mb-4">{mensajeActual}</p>
                  <Link to="/" className="btn btn-outline-secondary w-100">
                    Volver al inicio
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}