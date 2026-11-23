import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const puedeEditarCita = (cita) => {
  if (!cita?.fecha || !cita?.hora) return false;
  const [dia, mes, anio] = cita.fecha.split('/').map(Number);
  const [horas, minutos] = cita.hora.split(':').map(Number);
  const fechaCita = new Date(anio, mes - 1, dia, horas, minutos);
  const diffHoras = (fechaCita.getTime() - Date.now()) / (1000 * 60 * 60);
  return diffHoras >= 2;
};

export default function ModalMisCitas() {
  const {
    usuarioActual,
    citas,
    cargandoCitas,
    solicitarAperturaCita,
    iniciarEdicionCita,
    cancelarCita,
    cerrarModalBootstrap
  } = useContext(AppContext);

  const [confirmandoId, setConfirmandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [errorComprobante, setErrorComprobante] = useState('');
  const navigate = useNavigate();

  const misCitas = citas.filter(
    (cita) => usuarioActual && cita.usuario.toLowerCase() === usuarioActual.correo.toLowerCase()
  );

  const citasPendientes = misCitas.filter((cita) => !cita.pagado);
  const citasPagadas = misCitas.filter((cita) => cita.pagado);

  const irAPagar = (idCita) => {
    cerrarModalBootstrap('modalMisCitas');
    navigate(`/pago?id=${idCita}`);
  };

  const abrirNuevaCita = () => {
    cerrarModalBootstrap('modalMisCitas');
    setTimeout(() => solicitarAperturaCita(''), 200);
  };

  const confirmarCancelacion = async (idCita) => {
    setEliminandoId(idCita);
    await cancelarCita(idCita);
    setEliminandoId(null);
    setConfirmandoId(null);
  };

  const verComprobante = async (cita) => {
    const ventanaPdf = window.open('about:blank', '_blank');
    if (!ventanaPdf) {
      setErrorComprobante('Permite las ventanas emergentes para abrir el comprobante.');
      return;
    }
    ventanaPdf.opener = null;

    setErrorComprobante('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(18, 62, 50);
      doc.text('Veterinaria San Marcos', 105, 20, null, null, 'center');

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Comprobante de Pago Anticipado', 105, 30, null, null, 'center');

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 40, 190, 40);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Código de Transacción:', 20, 55);
      doc.setFont(undefined, 'bold');
      doc.text(cita.transaccion || 'N/A', 75, 55);

      doc.setFont(undefined, 'normal');
      doc.text('Fecha de Emisión:', 20, 65);
      doc.text(new Date().toLocaleDateString('es-CL'), 75, 65);

      doc.text('Paciente (Mascota):', 20, 75);
      doc.text(cita.mascota, 75, 75);

      doc.text('Fecha de la Cita:', 20, 85);
      doc.text(`${cita.fecha} a las ${cita.hora}`, 75, 85);

      doc.text('Servicio Pagado:', 20, 95);
      const servicioSplit = doc.splitTextToSize(cita.servicio, 110);
      doc.text(servicioSplit, 75, 95);

      doc.setDrawColor(18, 62, 50);
      doc.line(20, 115, 190, 115);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('¡Gracias por confiar el cuidado de tu mascota en nosotros!', 105, 125, null, null, 'center');

      const pdfUrl = URL.createObjectURL(doc.output('blob'));
      ventanaPdf.location.replace(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      ventanaPdf.close();
      console.error('No se pudo generar el comprobante PDF:', error);
      setErrorComprobante('No se pudo generar el comprobante. Intenta nuevamente.');
    }
  };

  const renderLista = (lista, esPendiente) => {
    if (cargandoCitas) {
      return (
        <div className="text-center py-4" role="status" aria-live="polite">
          <span className="spinner-border text-success mb-2" aria-hidden="true"></span>
          <p className="text-muted small mb-0">Cargando tus citas...</p>
        </div>
      );
    }

    if (lista.length === 0) {
      return (
        <div className="text-center py-4 px-3">
          <div className="fs-1 text-muted mb-2">
            <i className={`fa-regular ${esPendiente ? 'fa-calendar-plus' : 'fa-folder-open'}`}></i>
          </div>
          <p className="fw-semibold mb-1">
            {esPendiente ? 'No tienes citas pendientes' : 'Aún no tienes citas pagadas'}
          </p>
          <p className="text-muted small mb-3">
            {esPendiente
              ? 'Agenda una hora para tu mascota en menos de un minuto.'
              : 'Cuando pagues una cita, tu comprobante aparecerá aquí.'}
          </p>
          {esPendiente && (
            <button type="button" className="btn btn-primary btn-sm px-4" onClick={abrirNuevaCita}>
              <i className="fa-solid fa-plus me-1"></i> Solicitar una cita
            </button>
          )}
        </div>
      );
    }

    return lista.map((cita) => (
      <div className="cita-card" key={cita.id}>
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h3 className="h6 fw-bold mb-0">
            <i className="fa-regular fa-calendar me-2 text-success"></i>
            {cita.servicio}
          </h3>
          <span className={`badge ${cita.pagado ? 'bg-success' : 'bg-warning text-dark'}`}>
            {cita.pagado ? 'Pagada' : cita.estado}
          </span>
        </div>

        <div className="small mb-2">
          <p className="mb-1"><strong>Mascota:</strong> {cita.mascota} ({cita.tipoMascota})</p>
          <p className="mb-1"><strong>Fecha y hora:</strong> {cita.fecha} · {cita.hora} hrs</p>
          <p className="mb-0"><strong>Motivo:</strong> {cita.motivo}</p>
        </div>

        {cita.pagado ? (
          <div className="mt-3 p-3 bg-light rounded text-center border">
            <span className="badge bg-success mb-2">
              <i className="fa-solid fa-circle-check me-1"></i> Pago Confirmado
            </span>
            <small className="text-muted d-block mb-2">Código Tx: {cita.transaccion}</small>
            <button
              type="button"
              className="btn btn-sm btn-info text-white fw-bold w-100"
              onClick={() => verComprobante(cita)}
            >
              <i className="fa-solid fa-file-invoice me-1"></i> Ver Comprobante PDF
            </button>
          </div>
) : confirmandoId === cita.id ? (
          <div className="mt-3 p-2 bg-danger-subtle border border-danger rounded" role="alert" aria-live="polite">
            <p className="small fw-semibold text-danger mb-1">¿Seguro que deseas cancelar esta cita?</p>
            <p className="small text-muted mb-2">
              El horario ({cita.fecha} · {cita.hora} hrs) se liberará de inmediato para otros pacientes.
            </p>
            <div className="d-grid gap-2 d-sm-flex">
              <button
                type="button"
                className="btn btn-sm btn-danger"
                disabled={eliminandoId === cita.id}
                onClick={() => confirmarCancelacion(cita.id)}
              >
                {eliminandoId === cita.id ? 'Cancelando...' : 'Sí, cancelar cita'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={eliminandoId === cita.id}
                onClick={() => setConfirmandoId(null)}
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="d-grid gap-2 d-sm-flex acciones-cita-movil">
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={() => irAPagar(cita.id)}
              >
                <i className="fa-regular fa-credit-card me-1"></i> Pagar anticipado
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                disabled={!puedeEditarCita(cita)}
                title={!puedeEditarCita(cita) ? 'Solo editable con al menos 2 horas de anticipación' : 'Editar cita'}
                onClick={() => iniciarEdicionCita(cita)}
              >
                <i className="fa-regular fa-pen-to-square me-1"></i> Editar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setConfirmandoId(cita.id)}
              >
                <i className="fa-regular fa-trash-can me-1"></i> Cancelar
              </button>
            </div>
            {!puedeEditarCita(cita) && (
              <small className="text-muted d-block mt-2">
                <i className="fa-solid fa-circle-info me-1"></i>
                Esta cita no se puede editar porque faltan menos de 2 horas para la atención.
              </small>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="modal fade" id="modalMisCitas" tabIndex="-1" aria-labelledby="modalMisCitasLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="modalMisCitasLabel">
              <i className="fa-solid fa-list-check me-2"></i> Mis citas
            </h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div className="modal-body">
            {errorComprobante && (
              <div className="alert alert-warning small" role="alert" aria-live="polite">
                {errorComprobante}
              </div>
            )}
            <ul className="nav nav-tabs" id="misCitasTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active fw-bold"
                  id="pendientes-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#pendientes"
                  type="button"
                  role="tab"
                  aria-controls="pendientes"
                  aria-selected="true"
                  style={{ color: '#123e32' }}
                >
                  <i className="fa-regular fa-clock me-1"></i> Por Pagar ({citasPendientes.length})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link fw-bold"
                  id="pagadas-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#pagadas"
                  type="button"
                  role="tab"
                  aria-controls="pagadas"
                  aria-selected="false"
                  style={{ color: '#495057' }}
                >
                  <i className="fa-solid fa-check-double me-1"></i> Historial ({citasPagadas.length})
                </button>
              </li>
            </ul>

            <div className="tab-content pt-3" id="misCitasTabsContent">
              <div className="tab-pane fade show active" id="pendientes" role="tabpanel" aria-labelledby="pendientes-tab">
                <div id="listaCitasPendientes">{renderLista(citasPendientes, true)}</div>
              </div>

              <div className="tab-pane fade" id="pagadas" role="tabpanel" aria-labelledby="pagadas-tab">
                <div id="listaCitasPagadas">{renderLista(citasPagadas, false)}</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-primary me-auto"
              data-bs-toggle="modal"
              data-bs-target="#modalCuenta"
            >
              <i className="fa-solid fa-arrow-left me-2"></i> Volver a Mi cuenta
            </button>
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}