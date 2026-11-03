import React from 'react';
import ModalShell from './ModalShell';

export default function ShoppingCart({ show, onClose, citas = [], onCancelarCita }) {
  return (
    <ModalShell
      show={show}
      onClose={onClose}
      title="📅 Mis citas"
      size="modal-lg"
      footer={<button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>}
    >
      {citas.length === 0 ? (
        <p className="text-center text-muted my-4">No tienes citas registradas.</p>
      ) : citas.map((cita) => (
        <article className="cita-card" key={cita.id}>
          <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
            <h3 className="mb-0">🐾 {cita.servicio}</h3>
            <span className="estado-pendiente">{cita.estado || 'Pendiente'}</span>
          </div>
          <p><strong>Mascota:</strong> {cita.mascota}</p>
          <p><strong>Tipo:</strong> {cita.tipoMascota}</p>
          <p><strong>Fecha:</strong> {cita.fecha}</p>
          <p><strong>Hora:</strong> {cita.hora}</p>
          <p><strong>Motivo:</strong> {cita.motivo}</p>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onCancelarCita(cita.id)}>
            Cancelar cita
          </button>
        </article>
      ))}
    </ModalShell>
  );
}
