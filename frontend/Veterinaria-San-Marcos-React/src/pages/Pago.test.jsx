import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import Pago from './Pago';

const citaEjemplo = {
  id: 42,
  mascota: 'Luna',
  tipoMascota: 'Gato',
  servicio: 'Consulta general ($15.000)',
  fecha: '25/11/2026',
  hora: '11:00'
};

const renderPago = (url = '/pago?id=42', citas = [citaEjemplo]) => render(
  <MemoryRouter initialEntries={[url]}>
    <AppContext.Provider value={{ citas }}>
      <Pago />
    </AppContext.Provider>
  </MemoryRouter>
);

describe('flujo de pago', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bloquea el pago cuando la cita solicitada no existe', () => {
    renderPago('/pago?id=999');

    expect(screen.getByRole('heading', { name: 'Cita no encontrada' })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('muestra el detalle y calcula el monto desde el servicio de la cita', () => {
    renderPago();

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Consulta general ($15.000)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar a Transbank.*15\.000 CLP/ })).toBeInTheDocument();
    expect(screen.getByText(/No se realizará un cargo real/)).toBeInTheDocument();
  });

  it('inicia el pago con el ID de la cita y prepara el formulario de redirección', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'jwt-pago');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://webpay.example/checkout', token: 'token-transbank' })
    });
    renderPago();

    await user.click(screen.getByRole('button', { name: /Continuar a Transbank/ }));

    await waitFor(() => expect(HTMLFormElement.prototype.submit).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/pagos\/iniciar$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-pago' }),
        body: JSON.stringify({ idCita: 42 })
      })
    );
    expect(sessionStorage.getItem('citaPendientePago')).toBe('42');
    const formulario = [...document.forms].find((form) => form.action === 'https://webpay.example/checkout');
    expect(formulario?.querySelector('[name="token_ws"]')?.value).toBe('token-transbank');
  });

  it('muestra el error devuelto por el backend y limpia el pago pendiente', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('citaPendientePago', '42');
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ mensaje: 'Webpay no disponible.' })
    });
    renderPago();

    await user.click(screen.getByRole('button', { name: /Continuar a Transbank/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Webpay no disponible.');
    expect(sessionStorage.getItem('citaPendientePago')).toBeNull();
  });
});
