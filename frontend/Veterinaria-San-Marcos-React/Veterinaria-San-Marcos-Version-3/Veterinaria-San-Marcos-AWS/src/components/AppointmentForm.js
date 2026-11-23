import React, { useEffect, useState } from 'react';
import ModalShell from './ModalShell';
import { appointmentOptions, categoryToFirstOption, todayAsLocalDate } from '../data';

const blank = { mascota: '', tipoMascota: '', servicio: '', fecha: '', hora: '', motivo: '' };

export default function AppointmentForm({ show, onClose, categoriaInicial = '', onSubmit }) {
  const [values, setValues] = useState(blank);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setValues({ ...blank, servicio: categoryToFirstOption[categoriaInicial] || '' });
      setError('');
    }
  }, [show, categoriaInicial]);

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!values.mascota.trim() || !values.tipoMascota || !values.servicio || !values.fecha || !values.hora || !values.motivo.trim()) {
      setError('Completa todos los campos para solicitar la cita.');
      return;
    }
    if (values.fecha < todayAsLocalDate()) {
      setError('La fecha de la cita no puede ser anterior a hoy.');
      return;
    }
    if (values.hora < '09:00' || values.hora > '19:00') {
      setError('El horario de atención es de 09:00 a 19:00 hrs.');
      return;
    }
    onSubmit({ ...values, mascota: values.mascota.trim(), motivo: values.motivo.trim() });
    setValues(blank);
    setError('');
  };

  return (
    <ModalShell show={show} onClose={onClose} title="📅 Solicitar una cita" size="modal-lg"
      footer={<><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" form="form-cita" className="btn btn-primary">Solicitar cita</button></>}
    >
      {categoriaInicial && <div className="alert alert-info">Categoría seleccionada: <strong>{categoriaInicial}</strong>. Elige el procedimiento específico en el campo Servicio.</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form id="form-cita" onSubmit={submit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="cita-mascota">Nombre de la mascota</label>
            <input id="cita-mascota" className="form-control" placeholder="Ej: Luna" value={values.mascota} onChange={(event) => update('mascota', event.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="cita-tipo">Tipo de mascota</label>
            <select id="cita-tipo" className="form-select" value={values.tipoMascota} onChange={(event) => update('tipoMascota', event.target.value)}>
              <option value="">Selecciona una opción</option>
              {['Perro', 'Gato', 'Conejo', 'Ave'].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="cita-servicio">Servicio</label>
            <select id="cita-servicio" className="form-select" value={values.servicio} onChange={(event) => update('servicio', event.target.value)}>
              <option value="">Selecciona un servicio</option>
              {appointmentOptions.map((group) => (
                <optgroup label={group.group} key={group.group}>
                  {group.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="cita-fecha">Fecha</label>
            <input id="cita-fecha" className="form-control" type="date" min={todayAsLocalDate()} value={values.fecha} onChange={(event) => update('fecha', event.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="cita-hora">Horario (09:00 a 19:00)</label>
            <input id="cita-hora" className="form-control" type="time" min="09:00" max="19:00" value={values.hora} onChange={(event) => update('hora', event.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="cita-motivo">Motivo de la consulta</label>
            <textarea id="cita-motivo" className="form-control" rows="3" placeholder="Describe brevemente el motivo" value={values.motivo} onChange={(event) => update('motivo', event.target.value)} />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
