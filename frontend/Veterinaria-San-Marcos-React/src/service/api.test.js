import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  actualizarCitaApi,
  crearCitaApi,
  eliminarCitaApi,
  getAuthHeaders,
  iniciarSesion,
  obtenerCitas,
  obtenerHorasOcupadasApi,
  registrarUsuario
} from './api';

const crearRespuesta = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  text: vi.fn().mockResolvedValue(body === null ? '' : JSON.stringify(body))
});

describe('servicio HTTP', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('construye encabezados con y sin token de sesión', () => {
    expect(getAuthHeaders()).toEqual({ 'Content-Type': 'application/json' });

    localStorage.setItem('token', 'jwt-de-prueba');
    expect(getAuthHeaders()).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer jwt-de-prueba'
    });
  });

  it('registra usuarios enviando los datos como JSON', async () => {
    const usuario = { nombre: 'Ana Pérez', correo: 'ana@example.cl' };
    fetchMock.mockResolvedValue(crearRespuesta(201, { mensaje: 'Creado' }));

    await expect(registrarUsuario(usuario)).resolves.toEqual({ mensaje: 'Creado' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/registro$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(usuario)
      })
    );
  });

  it('preserva el mensaje del servidor cuando falla el registro', async () => {
    fetchMock.mockResolvedValue(crearRespuesta(409, { mensaje: 'Correo ya registrado.' }));

    await expect(registrarUsuario({ correo: 'ana@example.cl' }))
      .rejects.toMatchObject({ status: 409, message: 'Correo ya registrado.' });
  });

  it('inicia sesión y persiste el token y el usuario devueltos', async () => {
    const respuesta = {
      token: 'jwt-valido',
      usuario: { id: 8, correo: 'ana@example.cl', rol: 'CLIENTE' }
    };
    fetchMock.mockResolvedValue(crearRespuesta(200, respuesta));

    await expect(iniciarSesion('ana@example.cl', 'clave-segura')).resolves.toEqual(respuesta);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ correo: 'ana@example.cl', password: 'clave-segura' })
      })
    );
    expect(localStorage.getItem('token')).toBe('jwt-valido');
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(respuesta.usuario);
  });

  it('no persiste una sesión cuando el servidor rechaza las credenciales', async () => {
    fetchMock.mockResolvedValue(crearRespuesta(401, { mensaje: 'Correo o contraseña incorrectos.' }));

    await expect(iniciarSesion('ana@example.cl', 'incorrecta'))
      .rejects.toMatchObject({ status: 401 });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('consulta las citas usando el token de sesión', async () => {
    localStorage.setItem('token', 'jwt-citas');
    fetchMock.mockResolvedValue(crearRespuesta(200, [{ id: 3 }]));

    await expect(obtenerCitas()).resolves.toEqual([{ id: 3 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/citas$/),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-citas' })
      })
    );
  });

  it('crea una cita con los datos ingresados', async () => {
    const cita = { mascota: 'Luna', servicio: 'Consulta general' };
    fetchMock.mockResolvedValue(crearRespuesta(201, { id: 11, ...cita }));

    await expect(crearCitaApi(cita)).resolves.toEqual({ id: 11, ...cita });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/citas$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(cita) })
    );
  });

  it('codifica la fecha al consultar horarios ocupados', async () => {
    fetchMock.mockResolvedValue(crearRespuesta(200, ['10:00']));

    await expect(obtenerHorasOcupadasApi('22/11/2026')).resolves.toEqual(['10:00']);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/citas\/ocupadas\?fecha=22%2F11%2F2026$/),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('actualiza una cita existente mediante PUT', async () => {
    const cambios = { fecha: '25/11/2026', hora: '11:00' };
    fetchMock.mockResolvedValue(crearRespuesta(200, { id: 7, ...cambios }));

    await expect(actualizarCitaApi(7, cambios)).resolves.toEqual({ id: 7, ...cambios });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/citas\/7$/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(cambios) })
    );
  });

  it('elimina una cita y acepta una respuesta sin contenido', async () => {
    fetchMock.mockResolvedValue(crearRespuesta(204, null));

    await expect(eliminarCitaApi(9)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/citas\/9$/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
