import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Registro from './Registro';
import { registrarUsuario } from '../service/api';

vi.mock('../service/api', () => ({
  registrarUsuario: vi.fn()
}));

const renderRegistro = () => render(
  <MemoryRouter>
    <Registro />
  </MemoryRouter>
);

const completarFormulario = async (user, overrides = {}) => {
  const datos = {
    nombre: 'Ana Pérez',
    correo: 'ana@example.cl',
    telefono: '912345678',
    password: 'clave-segura',
    confirmacion: 'clave-segura',
    terminos: true,
    ...overrides
  };

  await user.type(screen.getByLabelText('Nombre completo'), datos.nombre);
  await user.type(screen.getByLabelText('Correo electrónico'), datos.correo);
  await user.type(screen.getByLabelText('Número de teléfono'), datos.telefono);
  await user.type(screen.getByLabelText('Contraseña', { selector: 'input' }), datos.password);
  await user.type(screen.getByLabelText('Confirmar contraseña', { selector: 'input' }), datos.confirmacion);
  if (datos.terminos) {
    await user.click(screen.getByLabelText('Acepto los términos y condiciones.'));
  }
};

describe('registro de usuario', () => {
  beforeEach(() => {
    registrarUsuario.mockReset();
  });

  it('muestra errores para todos los campos obligatorios vacíos', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('Ingresa tu nombre completo.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un teléfono válido.')).toBeInTheDocument();
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Debes confirmar tu contraseña.')).toBeInTheDocument();
    expect(screen.getByText('Debes aceptar los términos y condiciones.')).toBeInTheDocument();
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  it('rechaza nombres con números y formatos inválidos de correo y teléfono', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await completarFormulario(user, {
      nombre: 'Ana 2',
      correo: 'correo-invalido',
      telefono: '123',
      terminos: true
    });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('El nombre solo puede contener letras.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un teléfono válido.')).toBeInTheDocument();
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas con menos de seis caracteres', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await completarFormulario(user, { password: '12345', confirmacion: '12345' });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas que no coinciden', async () => {
    const user = userEvent.setup();
    renderRegistro();
    await completarFormulario(user, { confirmacion: 'otra-clave' });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  it('envía los datos normalizados y muestra confirmación al registrarse', async () => {
    const user = userEvent.setup();
    registrarUsuario.mockResolvedValue({ mensaje: 'Creado' });
    renderRegistro();
    await completarFormulario(user, {
      nombre: '  Ana Pérez  ',
      correo: ' ana@example.cl '
    });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('¡Cuenta creada correctamente!');
    expect(registrarUsuario).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      correo: 'ana@example.cl',
      telefono: '912345678',
      password: 'clave-segura'
    });
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();
  });

  it('muestra el error del servidor y permite reintentar el registro', async () => {
    const user = userEvent.setup();
    registrarUsuario.mockRejectedValueOnce(new Error('Correo ya registrado.'));
    renderRegistro();
    await completarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo ya registrado.');
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });
});
