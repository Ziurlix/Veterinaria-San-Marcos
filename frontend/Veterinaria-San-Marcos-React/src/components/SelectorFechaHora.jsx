import { useEffect, useRef, useState } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { obtenerHorasOcupadasApi } from '../service/api';

const HORAS_MANANA = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
const HORAS_TARDE = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
const HORAS_DEL_DIA = [...HORAS_MANANA, ...HORAS_TARDE];
const HORAS_VACIAS = new Set();

function esHoraPasada(fecha, hora) {
  if (!fecha) return false;
  const [dia, mes, anio] = fecha.split('/').map(Number);
  const ahora = new Date();
  const fechaHora = new Date(anio, mes - 1, dia, ...hora.split(':').map(Number));
  return fechaHora <= ahora;
}

export default function SelectorFechaHora({
  citaEnEdicion,
  errores,
  form,
  setErrores,
  setForm
}) {
  const fechaInputRef = useRef(null);
  const flatpickrRef = useRef(null);
  const fechaInicialRef = useRef(form.fecha);
  const [consultaHoras, setConsultaHoras] = useState({
    fecha: '',
    estado: 'cargando',
    horas: HORAS_VACIAS,
    error: ''
  });
  const [intentoConsulta, setIntentoConsulta] = useState(0);

  useEffect(() => {
    if (!fechaInputRef.current) return undefined;

    flatpickrRef.current = flatpickr(fechaInputRef.current, {
      locale: Spanish,
      dateFormat: 'd/m/Y',
      minDate: 'today',
      defaultDate: fechaInicialRef.current || null,
      disableMobile: true,
      disable: [(date) => date.getDay() === 0],
      onChange: (_, dateStr) => {
        setForm((prev) => ({ ...prev, fecha: dateStr, hora: '' }));
        setErrores((prev) => ({ ...prev, fecha: '', hora: '' }));
      }
    });

    return () => {
      flatpickrRef.current?.destroy();
      flatpickrRef.current = null;
    };
  }, [setErrores, setForm]);

  useEffect(() => {
    if (!form.fecha) return undefined;

    let activo = true;
    const fechaConsultada = form.fecha;

    obtenerHorasOcupadasApi(fechaConsultada)
      .then((horas) => {
        if (!activo) return;

        const horasReservadas = new Set(horas);
        if (citaEnEdicion?.fecha === fechaConsultada) {
          horasReservadas.delete(citaEnEdicion.hora);
        }

        setConsultaHoras({
          fecha: fechaConsultada,
          estado: 'listo',
          horas: horasReservadas,
          error: ''
        });
        setForm((prev) => (
          prev.fecha === fechaConsultada && horasReservadas.has(prev.hora)
            ? { ...prev, hora: '' }
            : prev
        ));
        setErrores((prev) => ({ ...prev, hora: '' }));
      })
      .catch((error) => {
        if (!activo) return;
        setConsultaHoras({
          fecha: fechaConsultada,
          estado: 'error',
          horas: HORAS_VACIAS,
          error: error.message || 'No se pudieron consultar los horarios disponibles.'
        });
      });

    return () => {
      activo = false;
    };
  }, [citaEnEdicion, form.fecha, intentoConsulta, setErrores, setForm]);

  const consultaActual = consultaHoras.fecha === form.fecha ? consultaHoras : null;
  const cargandoHoras = Boolean(form.fecha) &&
    (!consultaActual || consultaActual.estado === 'cargando');
  const errorHoras = consultaActual?.estado === 'error' ? consultaActual.error : '';
  const horasOcupadas = consultaActual?.estado === 'listo'
    ? consultaActual.horas
    : HORAS_VACIAS;
  const disponiblesCount = HORAS_DEL_DIA.filter(
    (hora) => !horasOcupadas.has(hora) && !esHoraPasada(form.fecha, hora)
  ).length;
  const sinHorasDisponibles = disponiblesCount === 0;

  const reintentarConsulta = () => {
    if (!form.fecha) return;
    setConsultaHoras({
      fecha: form.fecha,
      estado: 'cargando',
      horas: HORAS_VACIAS,
      error: ''
    });
    setIntentoConsulta((intento) => intento + 1);
  };

  const seleccionarHora = (hora) => {
    setForm((prev) => ({ ...prev, hora }));
    setErrores((prev) => ({ ...prev, hora: '' }));
  };

  const renderBloqueHoras = (titulo, horas) => (
    <div className="mb-3">
      <div className="small fw-semibold text-muted mb-2">{titulo}</div>
      <div className="d-flex flex-wrap gap-2">
        {horas.map((hora) => {
          const ocupada = horasOcupadas.has(hora);
          const pasada = Boolean(form.fecha) && esHoraPasada(form.fecha, hora);
          const deshabilitada = ocupada || pasada;
          const seleccionada = form.hora === hora;
          const motivoDeshabilitacion = ocupada ? 'Ocupada' : 'Pasada';

          return (
            <button
              key={hora}
              type="button"
              disabled={deshabilitada}
              onClick={() => seleccionarHora(hora)}
              className={`btn btn-sm px-3 ${
                deshabilitada
                  ? 'btn-secondary opacity-50 text-decoration-line-through'
                  : seleccionada
                  ? 'btn-primary fw-bold'
                  : 'btn-outline-primary'
              }`}
              title={deshabilitada ? `Horario ${motivoDeshabilitacion.toLowerCase()}` : `Seleccionar ${hora} hrs`}
              aria-label={deshabilitada ? `${hora} horas ${motivoDeshabilitacion.toLowerCase()}` : `Seleccionar ${hora} horas`}
              aria-describedby={errores.hora ? 'error-horarioCita' : undefined}
            >
              {hora} {deshabilitada && <span className="ms-1 small">({motivoDeshabilitacion})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="row g-3">
      <div className="col-12">
        <label htmlFor="fechaCita" className="form-label">Fecha de atención</label>
        <div className="input-group">
          <input
            ref={fechaInputRef}
            type="text"
            className={`form-control ${errores.fecha ? 'is-invalid' : ''}`}
            id="fechaCita"
            placeholder="Usa el botón para elegir un día"
            defaultValue={form.fecha}
            readOnly
            aria-describedby={`ayudaFechaCita${errores.fecha ? ' error-fechaCita' : ''}`}
          />
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => flatpickrRef.current?.open()}
            aria-label="Abrir calendario para elegir la fecha"
          >
            <i className="fa-regular fa-calendar me-1" aria-hidden="true"></i>
            Elegir fecha
          </button>
        </div>
        {errores.fecha && (
          <div id="error-fechaCita" className="invalid-feedback d-block" role="alert">
            {errores.fecha}
          </div>
        )}
        <div id="ayudaFechaCita" className="form-text mb-2">
          Elige un día hábil con el botón del calendario. La agenda en línea funciona de lunes a sábado;
          para urgencias, comunícate directamente con la clínica.
        </div>
        {form.fecha && !cargandoHoras && !errorHoras && (
          <div className="small text-success fw-semibold mb-2" aria-live="polite">
            {disponiblesCount} de {HORAS_DEL_DIA.length} horarios disponibles
          </div>
        )}
      </div>

      <div className="col-12">
        <label className="form-label d-block">
          Horario disponible
          <span className="ms-2 small text-muted fw-normal">(En gris = ocupado o pasado)</span>
        </label>
        {!form.fecha ? (
          <div className="alert alert-light border small text-muted mb-0">
            Elige una fecha con el calendario para consultar los horarios disponibles.
          </div>
        ) : cargandoHoras ? (
          <div className="p-3 bg-light border rounded text-center small" role="status" aria-live="polite">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Consultando horarios disponibles...
          </div>
        ) : errorHoras ? (
          <div className="alert alert-warning d-flex justify-content-between align-items-center small mb-0" role="alert" aria-live="polite">
            <span>{errorHoras}</span>
            <button type="button" className="btn btn-sm btn-outline-dark ms-2" onClick={reintentarConsulta}>
              Reintentar
            </button>
          </div>
        ) : sinHorasDisponibles ? (
          <div className="alert alert-secondary small mb-0" role="status" aria-live="polite">
            No quedan horarios disponibles para el {form.fecha}. Prueba con otro día.
          </div>
        ) : (
          <div className="p-3 bg-light border rounded">
            {renderBloqueHoras('Mañana', HORAS_MANANA)}
            {renderBloqueHoras('Tarde', HORAS_TARDE)}
          </div>
        )}
        {errores.hora && (
          <div id="error-horarioCita" className="invalid-feedback d-block" role="alert">
            {errores.hora}
          </div>
        )}
      </div>
    </div>
  );
}
