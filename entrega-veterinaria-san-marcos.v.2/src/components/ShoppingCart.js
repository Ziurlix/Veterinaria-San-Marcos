import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ShoppingCart({
  show,
  handleClose,
  citas = [],
  onCancelarCita = () => {}
}) {
  const listaCitas = Array.isArray(citas) ? citas : [];
  const subtotal = listaCitas.reduce((total, cita) => {
    return total + (Number(cita.precio) || 0);
  }, 0);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#e8f5f1' }}>
        <Modal.Title style={{ color: '#123e32', fontWeight: 700 }}>
          📅 Mis Citas Agendadas
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {listaCitas.length === 0 ? (
          <p className="text-center text-muted my-4">
            No tienes citas registradas actualmente.
          </p>
        ) : (
          <>
            {listaCitas.map((cita) => (
              <div key={cita.id} className="cita-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0 text-success fw-bold">🐾 {cita.servicio}</h4>
                  <span className="estado-pendiente">{cita.estado || 'Pendiente'}</span>
                </div>

                <p className="mb-1">
                  <strong>Mascota:</strong> {cita.mascota} ({cita.tipoMascota})
                </p>

                <p className="mb-1">
                  <strong>Fecha y Hora:</strong> {cita.fecha} a las {cita.hora} hrs
                </p>

                <p className="mb-2">
                  <strong>Motivo:</strong> {cita.motivo}
                </p>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onCancelarCita(cita.id)}
                >
                  Cancelar cita
                </Button>
              </div>
            ))}

            <div className="mt-3 border-top pt-3">
              <p className="mb-0">
                <strong>Subtotal total:</strong> {subtotal}
              </p>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
