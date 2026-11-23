import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import ModalLogin from './ModalLogin';

const renderLogin = (login = vi.fn()) => {
  const { container } = render(
    <MemoryRouter>
      <AppContext.Provider value={{ login }}>
        <ModalLogin />
      </AppContext.Provider>
    </MemoryRouter>
  );
  container.querySelector('#modalLogin').removeAttribute('aria-hidden');
  return login;
};

describe('modal de inicio de sesión', () => {
  it('valida campos vacíos antes de llamar al inicio de sesión', () => {
    const login = renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByText('Por favor completa todos los campos.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de error devuelto por la autenticación', async () => {
    const login = vi.fn().mockResolvedValue({
      success: false,
      msg: 'Correo o contraseña incorrectos.'
    });
    renderLogin(login);
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.cl' }
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'incorrecta' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('ana@example.cl', 'incorrecta');
  });

  it('cierra el modal cuando el usuario decide registrarse', () => {
    const hide = vi.fn();
    window.bootstrap = {
      Modal: {
        getInstance: vi.fn(() => ({ hide }))
      }
    };
    renderLogin();

    fireEvent.click(screen.getByRole('link', { name: 'Regístrate' }));

    expect(window.bootstrap.Modal.getInstance).toHaveBeenCalledWith(
      document.getElementById('modalLogin')
    );
    expect(hide).toHaveBeenCalled();
  });
});
