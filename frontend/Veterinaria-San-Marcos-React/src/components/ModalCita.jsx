import { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import SelectorFechaHora from './SelectorFechaHora';

const CATALOGO_SERVICIOS = {
  'Consulta General': [
    { valor: 'Consulta general ($15.000)', texto: 'Consulta general - $15.000', especies: ['Perro', 'Gato'] },
    { valor: 'Consulta urgencia ($25.000)', texto: 'Consulta urgencia - $25.000', especies: ['Perro', 'Gato'] },
    { valor: 'Control postoperatorio ($10.000)', texto: 'Control postoperatorio - $10.000', especies: ['Perro', 'Gato'] },
    { valor: 'Consulta ave / conejo ($18.000)', texto: 'Consulta ave / conejo - $18.000', especies: ['Ave', 'Conejo'] },
    { valor: 'Segunda opinión médica ($20.000)', texto: 'Segunda opinión médica - $20.000', especies: ['Perro', 'Gato', 'Ave', 'Conejo'] }
  ],
  Vacunación: [
    { valor: 'Vacuna antirrábica canina ($12.000)', texto: 'Vacuna antirrábica canina - $12.000', especies: ['Perro'] },
    { valor: 'Vacuna séxtuple canina ($18.000)', texto: 'Vacuna séxtuple canina - $18.000', especies: ['Perro'] },
    { valor: 'Vacuna Bordetella canina ($14.000)', texto: 'Vacuna Bordetella canina - $14.000', especies: ['Perro'] },
    { valor: 'Vacuna bivalente felina ($15.000)', texto: 'Vacuna bivalente felina - $15.000', especies: ['Gato'] },
    { valor: 'Vacuna triple felina ($17.000)', texto: 'Vacuna triple felina - $17.000', especies: ['Gato'] },
    { valor: 'Vacuna antirrábica felina ($12.000)', texto: 'Vacuna antirrábica felina - $12.000', especies: ['Gato'] }
  ],
  Cirugía: [
    { valor: 'Esterilización hembra canina ($80.000)', texto: 'Esterilización hembra canina - $80.000', especies: ['Perro'] },
    { valor: 'Esterilización macho canino ($60.000)', texto: 'Esterilización macho canino - $60.000', especies: ['Perro'] },
    { valor: 'Esterilización hembra felina ($65.000)', texto: 'Esterilización hembra felina - $65.000', especies: ['Gato'] },
    { valor: 'Esterilización macho felino ($50.000)', texto: 'Esterilización macho felino - $50.000', especies: ['Gato'] },
    { valor: 'Extirpación de tumor cutáneo ($120.000)', texto: 'Extirpación de tumor cutáneo - $120.000', especies: ['Perro', 'Gato'] },
    { valor: 'Cesárea de urgencia ($180.000)', texto: 'Cesárea de urgencia - $180.000', especies: ['Perro', 'Gato'] }
  ],
  Desparasitación: [
    { valor: 'Desparasitación interna pequeños (<10 kg) ($8.000)', texto: 'Desparasitación interna pequeños (<10 kg) - $8.000', especies: ['Perro'] },
    { valor: 'Desparasitación interna medianos (10-25 kg) ($9.500)', texto: 'Desparasitación interna medianos (10-25 kg) - $9.500', especies: ['Perro'] },
    { valor: 'Desparasitación interna grandes (>25 kg) ($11.000)', texto: 'Desparasitación interna grandes (>25 kg) - $11.000', especies: ['Perro'] },
    { valor: 'Desparasitación interna felina ($8.000)', texto: 'Desparasitación interna felina - $8.000', especies: ['Gato'] },
    { valor: 'Antiparasitario externo (pipeta) ($7.500)', texto: 'Antiparasitario externo (pipeta) - $7.500', especies: ['Perro', 'Gato'] }
  ],
  'Exámenes clínicos': [
    { valor: 'Hemograma completo ($22.000)', texto: 'Hemograma completo - $22.000', especies: ['Perro', 'Gato'] },
    { valor: 'Perfil bioquímico completo ($35.000)', texto: 'Perfil bioquímico completo - $35.000', especies: ['Perro', 'Gato'] },
    { valor: 'Radiografía (1 proyección) ($28.000)', texto: 'Radiografía (1 proyección) - $28.000', especies: ['Perro', 'Gato'] },
    { valor: 'Ecografía abdominal ($45.000)', texto: 'Ecografía abdominal - $45.000', especies: ['Perro', 'Gato'] },
    { valor: 'Test de leishmaniasis ($18.000)', texto: 'Test de leishmaniasis - $18.000', especies: ['Perro'] }
  ],
  'Procedimientos y Cuidados': [
    { valor: 'Corte de uñas ($5.000)', texto: 'Corte de uñas - $5.000', especies: ['Perro', 'Gato'] },
    { valor: 'Limpieza dental ($55.000)', texto: 'Limpieza dental - $55.000', especies: ['Perro', 'Gato'] },
    { valor: 'Microchip identificación ($15.000)', texto: 'Microchip identificación - $15.000', especies: ['Perro', 'Gato'] },
    { valor: 'Hospitalización (por día) ($30.000)', texto: 'Hospitalización (por día) - $30.000', especies: ['Perro', 'Gato'] }
  ]
};

const SERVICIOS_MOTIVO_OPCIONAL = new Set([
  'Corte de uñas ($5.000)',
  'Microchip identificación ($15.000)'
]);

const ESTADO_INICIAL = {
  mascota: '',
  tipoMascota: '',
  categoria: '',
  servicio: '',
  fecha: '',
  hora: '',
  motivo: ''
};

const BORRADOR_CITA_KEY = 'veterinaria-cita-borrador';

const leerBorradorCita = (idCita) => {
  if (typeof window === 'undefined') return null;
  const borradorGuardado = window.sessionStorage.getItem(BORRADOR_CITA_KEY);
  if (!borradorGuardado) return null;

  try {
    const borrador = JSON.parse(borradorGuardado);
    if ((borrador.idCita ?? null) !== (idCita ?? null)) return null;
    return borrador.form;
  } catch (error) {
    console.error('No se pudo recuperar el borrador de la cita:', error);
    window.sessionStorage.removeItem(BORRADOR_CITA_KEY);
    return null;
  }
};

export default function ModalCita() {
  const {
    citaEnEdicion,
    servicioPreseleccionado,
    guardarCita,
    cerrarModalBootstrap,
    cancelarEdicionCita,
    volverAMisCitas,
    citaFormKey
  } = useContext(AppContext);

  useEffect(() => {
    if (!citaEnEdicion) return undefined;
    const modal = document.getElementById('modalCita');
    if (!modal) return undefined;

    const volverAlCerrar = () => volverAMisCitas();
    modal.addEventListener('hidden.bs.modal', volverAlCerrar);
    return () => modal.removeEventListener('hidden.bs.modal', volverAlCerrar);
  }, [citaEnEdicion, volverAMisCitas]);

  return (
    <div className="modal fade" id="modalCita" tabIndex="-1" aria-labelledby="modalCitaLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <ModalCitaFormulario
          key={citaFormKey}
          citaEnEdicion={citaEnEdicion}
          servicioPreseleccionado={servicioPreseleccionado}
          guardarCita={guardarCita}
          cerrarModalBootstrap={cerrarModalBootstrap}
          cancelarEdicionCita={cancelarEdicionCita}
          volverAMisCitas={volverAMisCitas}
        />
      </div>
    </div>
  );
}

function ModalCitaFormulario({
  citaEnEdicion,
  servicioPreseleccionado,
  guardarCita,
  cerrarModalBootstrap,
  cancelarEdicionCita,
  volverAMisCitas
}) {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState(() => {
    const borrador = leerBorradorCita(citaEnEdicion?.id ?? null);
    if (borrador) return { ...ESTADO_INICIAL, ...borrador };
    return citaEnEdicion
      ? {
          mascota: citaEnEdicion.mascota || '',
          tipoMascota: citaEnEdicion.tipoMascota || '',
          categoria: citaEnEdicion.categoria || '',
          servicio: citaEnEdicion.servicio || '',
          fecha: citaEnEdicion.fecha || '',
          hora: citaEnEdicion.hora || '',
          motivo: citaEnEdicion.motivo || ''
        }
      : { ...ESTADO_INICIAL, categoria: servicioPreseleccionado || '' };
  });
  const [persistirBorrador, setPersistirBorrador] = useState(true);
  const [errores, setErrores] = useState({});
  const [alertaError, setAlertaError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!persistirBorrador) {
      window.sessionStorage.removeItem(BORRADOR_CITA_KEY);
      return;
    }

    window.sessionStorage.setItem(BORRADOR_CITA_KEY, JSON.stringify({
      idCita: citaEnEdicion?.id ?? null,
      form
    }));
  }, [citaEnEdicion?.id, form, persistirBorrador]);

  const categoriasDisponibles = useMemo(() => {
    const todas = Object.keys(CATALOGO_SERVICIOS);
    if (!form.tipoMascota) return todas;
    return todas.filter((cat) =>
      CATALOGO_SERVICIOS[cat].some((srv) => srv.especies.includes(form.tipoMascota))
    );
  }, [form.tipoMascota]);

  const serviciosDisponibles = useMemo(() => {
    if (!form.categoria || !form.tipoMascota) return [];
    const lista = CATALOGO_SERVICIOS[form.categoria] || [];
    return lista.filter((srv) => srv.especies.includes(form.tipoMascota));
  }, [form.categoria, form.tipoMascota]);

  const motivoEsOpcional =
    form.categoria === 'Vacunación' || SERVICIOS_MOTIVO_OPCIONAL.has(form.servicio);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const mapa = {
      nombreMascota: 'mascota',
      tipoMascota: 'tipoMascota',
      categoriaCita: 'categoria',
      servicioCita: 'servicio',
      motivoCita: 'motivo'
    };
    const campo = mapa[id];
    if (!campo) return;

    setForm((prev) => {
      if (campo === 'tipoMascota') {
        const catValida =
          prev.categoria &&
          CATALOGO_SERVICIOS[prev.categoria]?.some((s) => s.especies.includes(value));
        return {
          ...prev,
          tipoMascota: value,
          categoria: catValida ? prev.categoria : '',
          servicio: ''
        };
      }
      if (campo === 'mascota' && !value.trim()) {
        return { ...prev, mascota: value, categoria: '', servicio: '' };
      }
      if (campo === 'categoria') {
        return { ...prev, categoria: value, servicio: '' };
      }
      return { ...prev, [campo]: value };
    });

    const reiniciarErroresDependientes =
      campo === 'tipoMascota' ||
      campo === 'categoria' ||
      campo === 'servicio' ||
      (campo === 'mascota' && !value.trim());
    if (errores[campo] || reiniciarErroresDependientes) {
      setErrores((prev) => ({
        ...prev,
        [campo]: '',
        ...(reiniciarErroresDependientes
          ? { categoria: '', servicio: '', motivo: '' }
          : {})
      }));
    }
  };

  const validarPasoActual = () => {
    const nuevosErrores = {};
    if (paso === 1) {
      if (!form.mascota.trim()) nuevosErrores.mascota = 'Ingresa el nombre de tu mascota.';
      if (!form.tipoMascota) nuevosErrores.tipoMascota = 'Selecciona el tipo de mascota.';
      if (!form.categoria) nuevosErrores.categoria = 'Selecciona una categoría.';
      if (!form.servicio) nuevosErrores.servicio = 'Selecciona un servicio específico.';
    } else if (paso === 2) {
      if (!form.fecha) nuevosErrores.fecha = 'Selecciona una fecha para la atención.';
      if (!form.hora) nuevosErrores.hora = 'Elige un bloque horario disponible.';
    } else if (paso === 3) {
      if (!motivoEsOpcional && !form.motivo.trim()) {
        nuevosErrores.motivo = 'Cuéntanos brevemente el motivo de la consulta.';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return false;
    }
    return true;
  };

  const camposCitaListos = Boolean(form.mascota.trim() && form.tipoMascota);

  const handleSiguiente = (e) => {
    e.preventDefault();
    setAlertaError('');
    if (validarPasoActual()) {
      setPaso((prev) => prev + 1);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (paso !== 3) return; 
    setAlertaError('');
    if (!validarPasoActual()) return;

    const eraEdicion = Boolean(citaEnEdicion);
    setEnviando(true);
    const res = await guardarCita({
      mascota: form.mascota.trim(),
      tipoMascota: form.tipoMascota,
      categoria: form.categoria,
      servicio: form.servicio,
      fecha: form.fecha,
      hora: form.hora,
      motivo: form.motivo.trim()
    });
    setEnviando(false);

    if (!res.success) {
      const conflictoHorario = res.msg?.toLowerCase().includes('horario ya se encuentra reservado');
      setAlertaError(
        conflictoHorario
          ? 'Ese horario acaba de ser reservado. Elige otro horario disponible.'
          : res.msg
      );
      if (conflictoHorario) {
        setForm((prev) => ({ ...prev, hora: '' }));
        setErrores((prev) => ({ ...prev, hora: '' }));
        setPaso(2);
      }
      return;
    }

    setPersistirBorrador(false);
    setForm(ESTADO_INICIAL);
    setPaso(1);
    if (eraEdicion) {
      volverAMisCitas();
    } else {
      cerrarModalBootstrap('modalCita');
    }
  };

  const cancelarFormulario = () => {
    setPersistirBorrador(false);
    setForm(ESTADO_INICIAL);
    setPaso(1);
    if (citaEnEdicion) {
      cancelarEdicionCita();
      volverAMisCitas();
    } else {
      cerrarModalBootstrap('modalCita');
    }
  };

  return (
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="modalCitaLabel">
              <i className="fa-regular fa-calendar-check me-2"></i>
              {citaEnEdicion ? 'Editar cita' : 'Solicitar una cita'}
            </h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar y guardar borrador"></button>
          </div>

          <div className="modal-body">
            <p className="small text-muted mb-3">
              <i className="fa-regular fa-floppy-disk me-1" aria-hidden="true"></i>
              El borrador se guarda durante esta sesión; puedes cerrar y continuar después.
            </p>
            {/* Indicador de pasos */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
              {[
                { num: 1, label: 'Mascota y servicio' },
                { num: 2, label: 'Fecha y hora' },
                { num: 3, label: 'Confirmación' }
              ].map((step) => (
                <div key={step.num} className="d-flex align-items-center gap-2">
                  <span
                    className={`badge rounded-pill ${
                      paso >= step.num ? 'bg-success' : 'bg-secondary opacity-50'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`small d-none d-sm-inline ${
                      paso === step.num ? 'fw-bold text-dark' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {alertaError && (
              <div className="alert alert-danger py-2" role="alert" aria-live="polite">
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                {alertaError}
              </div>
            )}

            <form id="formCita" onSubmit={handleSubmit} noValidate>
              {/* PASO 1: Mascota y Servicio */}
              {paso === 1 && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className={`alert ${camposCitaListos ? 'alert-success' : 'alert-info'} py-2 small mb-0`} role="status" aria-live="polite">
                      <i className={`fa-solid ${camposCitaListos ? 'fa-circle-check' : 'fa-circle-info'} me-2`} aria-hidden="true"></i>
                      {camposCitaListos
                        ? 'Ya puedes elegir la categoría y el servicio.'
                        : 'Ingresa el nombre de tu mascota y selecciona su tipo para habilitar los servicios.'}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="nombreMascota" className="form-label">Nombre de la mascota</label>
                    <input
                      type="text"
                      className={`form-control ${errores.mascota ? 'is-invalid' : ''}`}
                      id="nombreMascota"
                      placeholder="Ej: Luna"
                      value={form.mascota}
                      onChange={handleChange}
                      aria-describedby={errores.mascota ? 'error-nombreMascota' : undefined}
                    />
                    {errores.mascota && (
                      <div id="error-nombreMascota" className="invalid-feedback d-block" role="alert">
                        {errores.mascota}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="tipoMascota" className="form-label">Tipo de mascota</label>
                    <select
                      className={`form-select ${errores.tipoMascota ? 'is-invalid' : ''}`}
                      id="tipoMascota"
                      value={form.tipoMascota}
                      onChange={handleChange}
                      aria-describedby={errores.tipoMascota ? 'error-tipoMascota' : undefined}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Conejo">Conejo</option>
                      <option value="Ave">Ave</option>
                    </select>
                    {errores.tipoMascota && (
                      <div id="error-tipoMascota" className="invalid-feedback d-block" role="alert">
                        {errores.tipoMascota}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="categoriaCita" className="form-label">Categoría</label>
                    <select
                      className={`form-select ${errores.categoria ? 'is-invalid' : ''}`}
                      id="categoriaCita"
                      disabled={!camposCitaListos}
                      value={form.categoria}
                      onChange={handleChange}
                      aria-describedby={errores.categoria ? 'error-categoriaCita' : undefined}
                    >
                      <option value="">
                        {!form.mascota.trim()
                          ? 'Primero ingresa el nombre de la mascota'
                          : !form.tipoMascota
                          ? 'Primero selecciona el tipo de mascota'
                          : 'Selecciona una categoría'}
                      </option>
                      {categoriasDisponibles.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errores.categoria && (
                      <div id="error-categoriaCita" className="invalid-feedback d-block" role="alert">
                        {errores.categoria}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="servicioCita" className="form-label">Servicio específico</label>
                    <select
                      className={`form-select ${errores.servicio ? 'is-invalid' : ''}`}
                      id="servicioCita"
                      disabled={!camposCitaListos || !form.categoria}
                      value={form.servicio}
                      onChange={handleChange}
                      aria-describedby={errores.servicio ? 'error-servicioCita' : undefined}
                    >
                      <option value="">
                        {!camposCitaListos
                          ? 'Completa nombre y tipo de mascota primero'
                          : !form.categoria
                          ? 'Primero selecciona una categoría'
                          : 'Selecciona un servicio específico'}
                      </option>
                      {serviciosDisponibles.map((srv) => (
                        <option key={srv.valor} value={srv.valor}>{srv.texto}</option>
                      ))}
                    </select>
                    {errores.servicio && (
                      <div id="error-servicioCita" className="invalid-feedback d-block" role="alert">
                        {errores.servicio}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASO 2: Fecha y Hora */}
              {paso === 2 && (
                <SelectorFechaHora
                  citaEnEdicion={citaEnEdicion}
                  errores={errores}
                  form={form}
                  setErrores={setErrores}
                  setForm={setForm}
                />
              )}

              {/* PASO 3: Motivo y Confirmación */}
              {paso === 3 && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="card border-success-subtle bg-light">
                      <div className="card-body small">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                          <span className="fw-bold text-success">
                            <i className="fa-solid fa-clipboard-check me-2"></i>
                            Resumen de solicitud
                          </span>
                          <span className="badge bg-warning text-dark">
                            {citaEnEdicion ? 'Edición de cita' : 'Solicitud pendiente de pago'}
                          </span>
                        </div>
                        <div><strong>Mascota:</strong> {form.mascota} ({form.tipoMascota})</div>
                        <div><strong>Servicio:</strong> {form.servicio}</div>
                        <div><strong>Fecha y hora:</strong> {form.fecha} a las {form.hora} hrs</div>
                        <div className="text-muted mt-2 pt-2 border-top">
                          <i className="fa-regular fa-clock me-1"></i>
                          Duración aprox.: 15 - 60 min según servicio · Esta acción registra una solicitud que podrás pagar luego en &quot;Mis citas&quot;.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="motivoCita" className="form-label">
                      Motivo de la consulta{motivoEsOpcional ? ' (opcional)' : ''}
                    </label>
                    <textarea
                      className={`form-control ${errores.motivo ? 'is-invalid' : ''}`}
                      id="motivoCita"
                      rows="3"
                      placeholder={
                        motivoEsOpcional
                          ? 'Si necesitas agregar información, puedes escribirla aquí'
                          : 'Describe brevemente síntomas, edad o detalles importantes'
                      }
                      value={form.motivo}
                      onChange={handleChange}
                      aria-describedby={errores.motivo ? 'error-motivoCita' : undefined}
                    ></textarea>
                    {errores.motivo && (
                      <div id="error-motivoCita" className="invalid-feedback d-block" role="alert">
                        {errores.motivo}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <div className="d-flex gap-2">
              {paso > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setPaso((prev) => prev - 1)}
                  disabled={enviando}
                >
                  ← Atrás
                </button>
              )}
              {citaEnEdicion ? (
                <button type="button" className="btn btn-outline-danger" onClick={cancelarFormulario}>
                  Cancelar edición
                </button>
              ) : paso === 1 ? (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelarFormulario}>
                  Cancelar
                </button>
              ) : null}
            </div>

            {paso < 3 ? (
              <button
                key="btn-siguiente"
                type="button"
                className="btn btn-primary"
                onClick={handleSiguiente}
              >
                Siguiente →
              </button>
            ) : (
              <button
                key="btn-confirmar"
                type="submit"
                form="formCita"
                className="btn btn-success"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : citaEnEdicion ? (
                  'Guardar cambios'
                ) : (
                  'Confirmar cita'
                )}
              </button>
            )}            
          </div>
        </div>
  );
}