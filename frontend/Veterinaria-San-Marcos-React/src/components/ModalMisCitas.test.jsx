import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import ModalMisCitas from './ModalMisCitas';

const pdfMock = vi.hoisted(() => ({
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  setLineWidth: vi.fn(),
  setDrawColor: vi.fn(),
  line: vi.fn(),
  setFont: vi.fn(),
  splitTextToSize: vi.fn(() => ['Consulta general']),
  output: vi.fn()
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function JsPDF() {
    return pdfMock;
  })
}));

const crearCita = (overrides = {}) => {
  const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const fechaTexto = fechaComoTexto(fecha);

  return {
    id: 5,
    usuario: 'ana@example.cl',
    mascota: 'Luna',
    tipoMascota: 'Gato',
    categoria: 'Consulta General',
    servicio: 'Consulta general ($15.000)',
    fecha: fechaTexto,
    hora: '12:00',
    motivo: 'Control',
    estado: 'Pendiente',
    pagado: false,
    ...overrides
  };
};

const fechaComoTexto = (fecha) => [
    String(fecha.getDate()).padStart(2, '0'),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    fecha.getFullYear()
  ].join('/');

const renderModal = (overrides = {}, initialPath = '/mis-citas') => {
  const contexto = {
    usuarioActual: { correo: 'ana@example.cl' },
    citas: [],
    cargandoCitas: false,
    solicitarAperturaCita: vi.fn(),
    iniciarEdicionCita: vi.fn(),
    cancelarCita: vi.fn().mockResolvedValue(undefined),
    cerrarModalBootstrap: vi.fn(),
    ...overrides
  };

  const { container } = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppContext.Provider value={contexto}>
        <Routes>
          <Route path="/mis-citas" element={<ModalMisCitas />} />
          <Route path="/pago" element={<h1>Ruta de pago</h1>} />
        </Routes>
      </AppContext.Provider>
    </MemoryRouter>
  );
  container.querySelector('#modalMisCitas')?.removeAttribute('aria-hidden');
  return contexto;
};

describe('modal Mis citas', () => {
  beforeEach(() => {
    pdfMock.output.mockReturnValue(new Blob(['comprobante'], { type: 'application/pdf' }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el estado de carga mientras obtiene las citas', () => {
    renderModal({ cargandoCitas: true });

    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getAllByText('Cargando tus citas...')).toHaveLength(2);
  });

  it('muestra estados vacíos distintos para citas pendientes e historial', () => {
    renderModal();

    expect(screen.getByText('No tienes citas pendientes')).toBeInTheDocument();
    expect(screen.getByText('Aún no tienes citas pagadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Solicitar una cita/ })).toBeInTheDocument();
  });

  it('solicita una cita nueva después de cerrar el modal actual', () => {
    vi.useFakeTimers();
    const contexto = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /Solicitar una cita/ }));
    expect(contexto.cerrarModalBootstrap).toHaveBeenCalledWith('modalMisCitas');
    expect(contexto.solicitarAperturaCita).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));
    expect(contexto.solicitarAperturaCita).toHaveBeenCalledWith('');
  });

  it('separa citas pendientes y pagadas, e ignora citas de otros usuarios', () => {
    const pendiente = crearCita();
    const pagada = crearCita({
      id: 6,
      mascota: 'Nina',
      pagado: true,
      estado: 'Pagada',
      transaccion: 'TX-123'
    });
    const ajena = crearCita({ id: 7, usuario: 'otra@example.cl', mascota: 'Max' });
    renderModal({ citas: [pendiente, pagada, ajena] });

    expect(screen.getByRole('tab', { name: /Por Pagar \(1\)/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Historial \(1\)/ })).toBeInTheDocument();
    expect(document.getElementById('listaCitasPendientes')).toHaveTextContent('Luna');
    expect(document.getElementById('listaCitasPagadas')).toHaveTextContent('Nina');
    expect(screen.queryByText('Max')).not.toBeInTheDocument();
    expect(screen.getByText('Pago Confirmado')).toBeInTheDocument();
    expect(screen.getByText('Código Tx: TX-123')).toBeInTheDocument();
  });

  it('navega a pagar con el ID de la cita seleccionada', () => {
    renderModal({ citas: [crearCita()] });

    fireEvent.click(screen.getByRole('button', { name: /Pagar anticipado/ }));

    expect(screen.getByRole('heading', { name: 'Ruta de pago' })).toBeInTheDocument();
  });

  it('permite editar citas futuras y deshabilita las que faltan menos de dos horas', () => {
    const editable = crearCita();
    const citaProxima = new Date(Date.now() + 60 * 60 * 1000);
    const proxima = crearCita({
      id: 6,
      fecha: fechaComoTexto(citaProxima),
      hora: citaProxima.toTimeString().slice(0, 5)
    });
    const contexto = renderModal({ citas: [editable, proxima] });

    const botonesEditar = screen.getAllByRole('button', { name: 'Editar' });
    expect(botonesEditar[0]).toBeEnabled();
    expect(botonesEditar[1]).toBeDisabled();
    expect(screen.getByText(/faltan menos de 2 horas/)).toBeInTheDocument();

    fireEvent.click(botonesEditar[0]);
    expect(contexto.iniciarEdicionCita).toHaveBeenCalledWith(editable);
  });

  it('pide confirmación antes de cancelar una cita y luego la elimina', async () => {
    const contexto = renderModal({ citas: [crearCita()] });

    fireEvent.click(screen.getByRole('button', { name: /^Cancelar$/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('¿Seguro que deseas cancelar esta cita?');

    fireEvent.click(screen.getByRole('button', { name: 'Sí, cancelar cita' }));
    await waitFor(() => expect(contexto.cancelarCita).toHaveBeenCalledWith(5));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('avisa cuando el navegador bloquea la ventana del comprobante', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderModal({ citas: [crearCita({ pagado: true, transaccion: 'TX-123' })] });

    fireEvent.click(screen.getByRole('button', { name: 'Ver Comprobante PDF' }));

    expect(open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Permite las ventanas emergentes para abrir el comprobante.'
    );
  });

  it('genera el PDF y abre el comprobante de una cita pagada', async () => {
    const ubicacion = { replace: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue({ opener: {}, location: ubicacion, close: vi.fn() });
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:comprobante');
    try {
      renderModal({ citas: [crearCita({ pagado: true, transaccion: 'TX-456' })] });

      fireEvent.click(screen.getByRole('button', { name: 'Ver Comprobante PDF' }));

      await waitFor(() => expect(ubicacion.replace).toHaveBeenCalledWith('blob:comprobante'));
      expect(pdfMock.text).toHaveBeenCalledWith('TX-456', 75, 55);
    } finally {
      if (originalCreateObjectURL) URL.createObjectURL = originalCreateObjectURL;
      else delete URL.createObjectURL;
    }
  });
});
