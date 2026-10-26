import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RegistrationForm from '../src/components/RegistrationForm';

describe('Suite 3: Componente RegistrationForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('CP-REG-01: Bloqueo de envío y marcado de error visual cuando existen campos obligatorios vacíos', async () => {
    render(<RegistrationForm show={true} handleClose={() => {}} onRegistroExitoso={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/Todos los campos son obligatorios/i)).toBeTruthy();
  });

  it('CP-REG-02: Rechazo de contraseñas con longitud inferior al mínimo permitido', async () => {
    render(<RegistrationForm show={true} handleClose={() => {}} onRegistroExitoso={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Ej.: Juan Pérez/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText(/ejemplo@correo/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Ej.: 9/i), { target: { value: '987654321' } });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText(/Repite tu contraseña/i), { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeTruthy();
  });

it('CP-REG-03: Rechazo por disparidad en la confirmación de la contraseña', async () => {
    render(<RegistrationForm show={true} handleClose={() => {}} onRegistroExitoso={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Ej.: Juan Pérez/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText(/ejemplo@correo/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Ej.: 9/i), { target: { value: '987654321' } });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: 'secreto1' } });
    fireEvent.change(screen.getByPlaceholderText(/Repite tu contraseña/i), { target: { value: 'secreto2' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeTruthy();
  });

  it('CP-REG-04: Exigencia de aceptación de los términos y condiciones', async () => {
    render(<RegistrationForm show={true} handleClose={() => {}} onRegistroExitoso={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Ej.: Juan Pérez/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText(/ejemplo@correo/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Ej.: 9/i), { target: { value: '987654321' } });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: 'secreto' } });
    fireEvent.change(screen.getByPlaceholderText(/Repite tu contraseña/i), { target: { value: 'secreto' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/Debes aceptar los términos y condiciones/i)).toBeTruthy();
  });
});
