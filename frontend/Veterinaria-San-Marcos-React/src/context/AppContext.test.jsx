import { act, renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  actualizarCitaApi,
  crearCitaApi,
  eliminarCitaApi,
  HttpError,
  iniciarSesion,
  obtenerCitas
} from '../service/api';
import { AppContext, AppProvider } from './AppContext';

vi.mock('../service/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    actualizarCitaApi: vi.fn(),
    crearCitaApi: vi.fn(),
    eliminarCitaApi: vi.fn(),
    iniciarSesion: vi.fn(),
    obtenerCitas: vi.fn()
  };
});

const usuario = {
  id: 1,
  nombre: 'Ana Pérez',
  correo: 'ana@example.cl',
  telefono: '912345678',
  rol: 'CLIENTE'
};

const cita = {
  id: 12,
  usuario: usuario.correo,
  mascota: 'Luna',
  pagado: false
};

const renderContexto = () => renderHook(() => useContext(AppContext), {
  wrapper: ({ children }) => <AppProvider>{children}</AppProvider>
});

const prepararModales = () => {
  document.body.innerHTML = `
    <div id="modalLogin"></div>
    <div id="modalCita"></div>
    <div id="modalMisCitas"></div>
    <div id="modalCuenta"></div>
  `;
  const modal = { show: vi.fn(), hide: vi.fn() };
  window.bootstrap = {
    Modal: {
      getOrCreateInstance: vi.fn(() => modal),
      getInstance: vi.fn(() => modal)
    }
  };
  return modal;
};

const iniciarConSesion = async (citas = []) => {
  localStorage.setItem('token', 'jwt-activo');
  localStorage.setItem('usuario', JSON.stringify(usuario));
  obtenerCitas.mockResolvedValue(citas);
  const context = renderContexto();
  await waitFor(() => expect(context.result.current.cargandoCitas).toBe(false));
  return context;
};

describe('estado global de la aplicación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerCitas.mockResolvedValue([]);
    delete window.bootstrap;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.bootstrap;
  });

  it('inicia como visitante cuando no hay sesión guardada', () => {
    const { result } = renderContexto();

    expect(result.current.usuarioLogueado).toBe(false);
    expect(result.current.usuarioActual).toBeNull();
    expect(result.current.citas).toEqual([]);
    expect(obtenerCitas).not.toHaveBeenCalled();
  });

  it('restaura usuario y citas cuando existe una sesión persistida', async () => {
    localStorage.setItem('token', 'jwt-activo');
    localStorage.setItem('usuario', JSON.stringify(usuario));
    obtenerCitas.mockResolvedValue([cita]);
    const { result } = renderContexto();

    await waitFor(() => expect(result.current.citas).toEqual([cita]));
    expect(result.current.usuarioLogueado).toBe(true);
    expect(result.current.usuarioActual).toEqual(usuario);
  });

  it('inicia sesión y carga las citas del usuario', async () => {
    iniciarSesion.mockResolvedValue({ usuario });
    obtenerCitas.mockResolvedValue([cita]);
    const { result } = renderContexto();
    let respuesta;

    await act(async () => {
      respuesta = await result.current.login(usuario.correo, 'clave');
    });

    expect(respuesta).toEqual({ success: true });
    expect(result.current.usuarioLogueado).toBe(true);
    expect(result.current.usuarioActual).toEqual(usuario);
    expect(result.current.citas).toEqual([cita]);
  });

  it('devuelve el error de autenticación sin iniciar sesión', async () => {
    iniciarSesion.mockRejectedValue(new Error('Credenciales incorrectas.'));
    const { result } = renderContexto();
    let respuesta;

    await act(async () => {
      respuesta = await result.current.login('ana@example.cl', 'mala');
    });

    expect(respuesta).toEqual({ success: false, msg: 'Credenciales incorrectas.' });
    expect(result.current.usuarioLogueado).toBe(false);
  });

  it('retoma el servicio solicitado antes de iniciar sesión', async () => {
    vi.useFakeTimers();
    prepararModales();
    iniciarSesion.mockResolvedValue({ usuario });
    const { result } = renderContexto();

    act(() => result.current.solicitarAperturaCita('Vacunación'));
    expect(window.bootstrap.Modal.getOrCreateInstance).toHaveBeenCalledWith(
      document.getElementById('modalLogin')
    );

    await act(async () => {
      await result.current.login(usuario.correo, 'clave');
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.servicioPreseleccionado).toBe('Vacunación');
    expect(result.current.citaFormKey).toBe(1);
    expect(window.bootstrap.Modal.getOrCreateInstance).toHaveBeenLastCalledWith(
      document.getElementById('modalCita')
    );
  });

  it('abre el formulario de una cita nueva para un usuario autenticado', async () => {
    prepararModales();
    const { result } = await iniciarConSesion();

    act(() => result.current.solicitarAperturaCita('Consulta General'));

    expect(result.current.servicioPreseleccionado).toBe('Consulta General');
    expect(result.current.citaFormKey).toBe(1);
    expect(window.bootstrap.Modal.getOrCreateInstance).toHaveBeenCalledWith(
      document.getElementById('modalCita')
    );
  });

  it('prepara la cita seleccionada para edición y permite cancelar la edición', async () => {
    prepararModales();
    const { result } = await iniciarConSesion([cita]);

    act(() => result.current.iniciarEdicionCita(cita));
    expect(result.current.citaEnEdicion).toEqual(cita);
    expect(result.current.citaFormKey).toBe(1);

    act(() => result.current.cancelarEdicionCita());
    expect(result.current.citaEnEdicion).toBeNull();
    expect(result.current.servicioPreseleccionado).toBe('');
  });

  it('impide guardar una cita si no hay un usuario autenticado', async () => {
    const { result } = renderContexto();
    let respuesta;

    await act(async () => {
      respuesta = await result.current.guardarCita({ mascota: 'Luna' });
    });

    expect(respuesta).toEqual({
      success: false,
      msg: 'Debes iniciar sesión para agendar.'
    });
    expect(crearCitaApi).not.toHaveBeenCalled();
  });

  it('crea una cita y actualiza la lista local', async () => {
    const nueva = { ...cita, id: 13 };
    crearCitaApi.mockResolvedValue(nueva);
    const { result } = await iniciarConSesion();
    let respuesta;

    await act(async () => {
      respuesta = await result.current.guardarCita({ mascota: 'Luna' });
    });

    expect(respuesta.success).toBe(true);
    expect(result.current.citas).toEqual([nueva]);
  });

  it('expone el error cuando falla la creación de una cita', async () => {
    crearCitaApi.mockRejectedValue(new Error('Horario ocupado.'));
    const { result } = await iniciarConSesion();
    let respuesta;

    await act(async () => {
      respuesta = await result.current.guardarCita({ mascota: 'Luna' });
    });

    expect(respuesta).toEqual({ success: false, msg: 'Horario ocupado.' });
    expect(result.current.citas).toEqual([]);
  });

  it('actualiza una cita existente en el estado local', async () => {
    const actualizada = { ...cita, mascota: 'Nina' };
    actualizarCitaApi.mockResolvedValue(actualizada);
    const { result } = await iniciarConSesion([cita]);
    act(() => result.current.iniciarEdicionCita(cita));
    let respuesta;

    await act(async () => {
      respuesta = await result.current.guardarCita({ mascota: 'Nina' });
    });

    expect(respuesta.success).toBe(true);
    expect(result.current.citas).toEqual([actualizada]);
    expect(result.current.citaEnEdicion).toBeNull();
  });

  it('elimina la cita local solo después de confirmar la eliminación en la API', async () => {
    eliminarCitaApi.mockResolvedValue(null);
    const { result } = await iniciarConSesion([cita]);

    await act(async () => {
      await result.current.cancelarCita(cita.id);
    });

    expect(eliminarCitaApi).toHaveBeenCalledWith(cita.id);
    expect(result.current.citas).toEqual([]);
  });

  it('marca como pagada solo la cita cuyo ID fue confirmado por Transbank', async () => {
    const otraCita = { ...cita, id: 14 };
    const { result } = await iniciarConSesion([cita, otraCita]);

    act(() => result.current.confirmarPagoCita(String(cita.id), 'TX-123'));

    expect(result.current.citas[0]).toMatchObject({
      pagado: true,
      estado: 'Pagada',
      transaccion: 'TX-123'
    });
    expect(result.current.citas[1]).toEqual(otraCita);
  });

  it('cierra la sesión cuando la carga de citas devuelve 401', async () => {
    prepararModales();
    localStorage.setItem('token', 'jwt-expirado');
    localStorage.setItem('usuario', JSON.stringify(usuario));
    obtenerCitas.mockRejectedValue(new HttpError(401, 'Sesión expirada.'));
    const { result } = renderContexto();

    await waitFor(() => expect(result.current.usuarioLogueado).toBe(false));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(window.bootstrap.Modal.getOrCreateInstance).toHaveBeenCalledWith(
      document.getElementById('modalLogin')
    );
  });
});
