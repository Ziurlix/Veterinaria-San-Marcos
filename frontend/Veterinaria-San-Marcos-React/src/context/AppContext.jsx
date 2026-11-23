import { createContext, useState, useEffect, useCallback } from 'react';
import {
  iniciarSesion,
  obtenerCitas,
  crearCitaApi,
  actualizarCitaApi,
  eliminarCitaApi,
  HttpError
} from '../service/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citaEnEdicion, setCitaEnEdicion] = useState(null);
  const [servicioPreseleccionado, setServicioPreseleccionado] = useState('');
  const [servicioPendienteLogin, setServicioPendienteLogin] = useState(null);
  const [citaFormKey, setCitaFormKey] = useState(0);

  const [cargandoCitas, setCargandoCitas] = useState(false);

  const manejarErrorSesion = (error) => {
    if (error instanceof HttpError && error.status === 401) {
      logout();
      cerrarModalBootstrap('modalCita');
      cerrarModalBootstrap('modalMisCitas');
      cerrarModalBootstrap('modalCuenta');
      abrirModalBootstrap('modalLogin');
      return true;
    }
    return false;
  };

  const cargarCitasBackend = async () => {
    setCargandoCitas(true);
    try {
      const lista = await obtenerCitas();
      setCitas(lista);
    } catch (error) {
      if (!manejarErrorSesion(error)) {
        console.error('Error al obtener citas:', error.message);
      }
      setCitas([]);
    } finally {
      setCargandoCitas(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (token && usuarioGuardado) {
      setUsuarioLogueado(true);
      setUsuarioActual(JSON.parse(usuarioGuardado));
      cargarCitasBackend();
    }
  }, []);

  const abrirModalBootstrap = (id) => {
    const el = document.getElementById(id);
    if (!el || !window.bootstrap?.Modal) return;
    window.bootstrap.Modal.getOrCreateInstance(el).show();
  };

  const cerrarModalBootstrap = (id) => {
    const el = document.getElementById(id);
    if (!el || !window.bootstrap?.Modal) return;
    const instance = window.bootstrap.Modal.getInstance(el);
    if (instance) instance.hide();
  };

  const volverAMisCitas = () => {
    cerrarModalBootstrap('modalCita');
    window.setTimeout(() => abrirModalBootstrap('modalMisCitas'), 200);
  };

  const login = async (correo, password) => {
    try {
      const data = await iniciarSesion(correo, password);

      setUsuarioLogueado(true);
      setUsuarioActual(data.usuario);
      await cargarCitasBackend();

      if (servicioPendienteLogin) {
        const pend = servicioPendienteLogin;
        setServicioPendienteLogin(null);
        setTimeout(() => {
          setCitaEnEdicion(null);
          setServicioPreseleccionado(pend);
          setCitaFormKey((key) => key + 1);
          abrirModalBootstrap('modalCita');
        }, 300);
      }

      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message || 'Correo o contraseña incorrectos.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('veterinaria-cita-borrador');
    sessionStorage.removeItem('usuarioLogueado');
    sessionStorage.removeItem('correoUsuarioActual');
    setUsuarioLogueado(false);
    setUsuarioActual(null);
    setCitas([]);
    setServicioPendienteLogin(null);
  };

  const solicitarAperturaCita = (servicio = '') => {
    if (!usuarioLogueado) {
      setServicioPendienteLogin(servicio || null);
      abrirModalBootstrap('modalLogin');
      return;
    }
    setCitaEnEdicion(null);
    setServicioPreseleccionado(servicio);
    setCitaFormKey((key) => key + 1);
    abrirModalBootstrap('modalCita');
  };

  const iniciarEdicionCita = (cita) => {
    setCitaEnEdicion(cita);
    setServicioPreseleccionado('');
    setCitaFormKey((key) => key + 1);
    cerrarModalBootstrap('modalMisCitas');
    abrirModalBootstrap('modalCita');
  };

  const cancelarEdicionCita = () => {
    setCitaEnEdicion(null);
    setServicioPreseleccionado('');
  };

  const guardarCita = async (datosCita) => {
    if (!usuarioActual) {
      return { success: false, msg: 'Debes iniciar sesión para agendar.' };
    }

    try {
      if (citaEnEdicion) {
        const actualizada = await actualizarCitaApi(citaEnEdicion.id, datosCita);
        setCitas((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)));
        setCitaEnEdicion(null);
        return { success: true, msg: 'Cita actualizada correctamente.' };
      }

      const nuevaCita = await crearCitaApi(datosCita);
      setCitas((prev) => [...prev, nuevaCita]);
      return { success: true, msg: 'Solicitud de cita enviada correctamente.' };
    } catch (error) {
      return { success: false, msg: error.message || 'Error al guardar la cita.' };
    }
  };

  const cancelarCita = async (idCita) => {
    try {
      await eliminarCitaApi(idCita);
      setCitas((prev) => prev.filter((c) => c.id !== idCita));
    } catch (error) {
      console.error('Error al eliminar cita:', error.message);
    }
  };

  const confirmarPagoCita = useCallback((idCita, codigoTransaccion) => {
    setCitas((prev) =>
      prev.map((c) =>
        c.id === Number(idCita)
          ? {
              ...c,
              pagado: true,
              estado: 'Pagada',
              transaccion: codigoTransaccion
            }
          : c
      )
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        usuarioLogueado,
        usuarioActual,
        citas,
        citaFormKey,
        cargandoCitas,
        citaEnEdicion,
        servicioPreseleccionado,
        login,
        logout,
        solicitarAperturaCita,
        iniciarEdicionCita,
        cancelarEdicionCita,
        volverAMisCitas,
        guardarCita,
        cancelarCita,
        cerrarModalBootstrap,
        confirmarPagoCita
      }}
    >
      {children}
    </AppContext.Provider>
  );
};