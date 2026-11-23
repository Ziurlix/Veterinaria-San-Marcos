import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import ModalCita from './ModalCita';

vi.mock('./SelectorFechaHora', () => ({
  default: ({ form, setForm }) => (
    <div>
      <output data-testid="fecha-hora">{`${form.fecha}|${form.hora}`}</output>
      <button
        type="button"
        onClick={() => setForm((prev) => ({
          ...prev,
          fecha: '29/11/2026',
          hora: '10:30'
        }))}
      >
        Asignar fecha y hora
      </button>
    </div>
  )
}));

const crearContexto = (overrides = {}) => ({
  citaEnEdicion: null,
  servicioPreseleccionado: '',
  guardarCita: vi.fn().mockResolvedValue({ success: true }),
  cerrarModalBootstrap: vi.fn(),
  cancelarEdicionCita: vi.fn(),
  volverAMisCitas: vi.fn(),
  citaFormKey: 0,
  ...overrides
});

const renderModal = (contexto = crearContexto()) => {
  const { container } = render(
    <AppContext.Provider value={contexto}>
      <ModalCita />
    </AppContext.Provider>
  );
  container.querySelector('#modalCita').removeAttribute('aria-hidden');
  return contexto;
};

const completarPasoUno = async (
  user,
  categoria = 'Consulta General',
  servicio = 'Consulta general ($15.000)',
  tipo = 'Perro'
) => {
  await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna');
  await user.selectOptions(screen.getByLabelText('Tipo de mascota'), tipo);
  await user.selectOptions(screen.getByLabelText('Categoría'), categoria);
  await user.selectOptions(screen.getByLabelText('Servicio específico'), servicio);
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
};

const avanzarHastaConfirmacion = async (user, ...datosPasoUno) => {
  await completarPasoUno(user, ...datosPasoUno);
  await user.click(screen.getByRole('button', { name: 'Asignar fecha y hora' }));
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
};

describe('formulario de cita', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('bloquea categorías y servicios hasta ingresar nombre y tipo de mascota', () => {
    renderModal();

    expect(screen.getByLabelText('Categoría')).toBeDisabled();
    expect(screen.getByLabelText('Servicio específico')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ingresa el nombre de tu mascota y selecciona su tipo'
    );
  });

  it('valida los campos del primer paso antes de avanzar', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    expect(screen.getByText('Ingresa el nombre de tu mascota.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el tipo de mascota.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un servicio específico.')).toBeInTheDocument();
  });

  it('filtra los servicios por especie y limpia una selección incompatible', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna');
    await user.selectOptions(screen.getByLabelText('Tipo de mascota'), 'Perro');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Cirugía');
    await user.selectOptions(
      screen.getByLabelText('Servicio específico'),
      'Esterilización hembra canina ($80.000)'
    );

    await user.selectOptions(screen.getByLabelText('Tipo de mascota'), 'Ave');

    expect(screen.getByLabelText('Categoría')).toHaveValue('');
    expect(screen.getByLabelText('Servicio específico')).toBeDisabled();
    expect(screen.queryByRole('option', { name: 'Cirugía' })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Consulta General');
    expect(screen.getByRole('option', { name: 'Consulta ave / conejo - $18.000' }))
      .toBeInTheDocument();
  });

  it('requiere un motivo para una consulta general', async () => {
    const user = userEvent.setup();
    const contexto = renderModal();
    await avanzarHastaConfirmacion(user);

    await user.click(screen.getByRole('button', { name: 'Confirmar cita' }));

    expect(screen.getByText('Cuéntanos brevemente el motivo de la consulta.')).toBeInTheDocument();
    expect(contexto.guardarCita).not.toHaveBeenCalled();
  });

  it('permite confirmar una vacunación sin motivo y cierra el modal', async () => {
    const user = userEvent.setup();
    const contexto = renderModal();
    await avanzarHastaConfirmacion(
      user,
      'Vacunación',
      'Vacuna antirrábica canina ($12.000)'
    );

    expect(screen.getByLabelText('Motivo de la consulta (opcional)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar cita' }));

    expect(contexto.guardarCita).toHaveBeenCalledWith({
      mascota: 'Luna',
      tipoMascota: 'Perro',
      categoria: 'Vacunación',
      servicio: 'Vacuna antirrábica canina ($12.000)',
      fecha: '29/11/2026',
      hora: '10:30',
      motivo: ''
    });
    expect(contexto.cerrarModalBootstrap).toHaveBeenCalledWith('modalCita');
  });

  it('vuelve al paso de horario y limpia la hora si otro usuario la reservó', async () => {
    const user = userEvent.setup();
    const contexto = renderModal(crearContexto({
      guardarCita: vi.fn().mockResolvedValue({
        success: false,
        msg: 'El horario ya se encuentra reservado.'
      })
    }));
    await avanzarHastaConfirmacion(user);
    await user.type(screen.getByLabelText('Motivo de la consulta'), 'Control preventivo');
    await user.click(screen.getByRole('button', { name: 'Confirmar cita' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ese horario acaba de ser reservado. Elige otro horario disponible.'
    );
    expect(screen.getByTestId('fecha-hora')).toHaveTextContent('29/11/2026|');
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeInTheDocument();
    expect(contexto.cerrarModalBootstrap).not.toHaveBeenCalled();
  });

  it('muestra errores generales del guardado sin perder el paso ni el borrador', async () => {
    const user = userEvent.setup();
    const contexto = renderModal(crearContexto({
      guardarCita: vi.fn().mockResolvedValue({ success: false, msg: 'Error de conexión.' })
    }));
    await avanzarHastaConfirmacion(user);
    await user.type(screen.getByLabelText('Motivo de la consulta'), 'Control preventivo');
    await user.click(screen.getByRole('button', { name: 'Confirmar cita' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Error de conexión.');
    expect(screen.getByRole('button', { name: 'Confirmar cita' })).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem('veterinaria-cita-borrador')).form)
      .toMatchObject({ mascota: 'Luna', motivo: 'Control preventivo' });
    expect(contexto.volverAMisCitas).not.toHaveBeenCalled();
  });

  it('restaura borradores de la sesión y elimina los que no se pueden leer', () => {
    sessionStorage.setItem('veterinaria-cita-borrador', JSON.stringify({
      idCita: null,
      form: { mascota: 'Nina', tipoMascota: 'Gato', categoria: 'Consulta General' }
    }));
    renderModal();

    expect(screen.getByLabelText('Nombre de la mascota')).toHaveValue('Nina');
    expect(screen.getByLabelText('Tipo de mascota')).toHaveValue('Gato');

    cleanup();
    sessionStorage.setItem('veterinaria-cita-borrador', '{dato inválido');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderModal();

    expect(sessionStorage.getItem('veterinaria-cita-borrador')).not.toBe('{dato inválido');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('al cancelar una edición regresa a Mis citas y escucha el cierre del modal', async () => {
    const citaEnEdicion = {
      id: 21,
      mascota: 'Nina',
      tipoMascota: 'Gato',
      categoria: 'Consulta General',
      servicio: 'Consulta general ($15.000)',
      fecha: '29/11/2026',
      hora: '10:30',
      motivo: ''
    };
    const contexto = renderModal(crearContexto({ citaEnEdicion }));

    expect(screen.getByRole('heading', { name: 'Editar cita' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de la mascota')).toHaveValue('Nina');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(contexto.cancelarEdicionCita).toHaveBeenCalled();
    expect(contexto.volverAMisCitas).toHaveBeenCalled();

    fireEvent(document.getElementById('modalCita'), new Event('hidden.bs.modal'));
    expect(contexto.volverAMisCitas).toHaveBeenCalledTimes(2);
  });
});
