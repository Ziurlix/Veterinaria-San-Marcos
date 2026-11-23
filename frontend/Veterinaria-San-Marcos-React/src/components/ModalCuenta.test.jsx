import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import ModalCuenta from './ModalCuenta';

const renderCuenta = (usuarioActual, logout = vi.fn()) => {
  const { container } = render(
    <AppContext.Provider value={{ usuarioActual, logout }}>
      <ModalCuenta />
    </AppContext.Provider>
  );
  container.querySelector('#modalCuenta').removeAttribute('aria-hidden');
  return logout;
};

describe('modal Mi cuenta', () => {
  it('muestra los datos del usuario y cierra su sesión', () => {
    const hide = vi.fn();
    const logout = vi.fn();
    window.bootstrap = {
      Modal: {
        getInstance: vi.fn(() => ({ hide }))
      }
    };
    renderCuenta({
      nombre: 'Ana Pérez',
      correo: 'ana@example.cl',
      telefono: '912345678'
    }, logout);

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@example.cl')).toBeInTheDocument();
    expect(screen.getByText('912345678')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalled();
    expect(hide).toHaveBeenCalled();
  });

  it('muestra guiones cuando todavía no hay información del usuario', () => {
    renderCuenta(null);

    expect(screen.getAllByText('-')).toHaveLength(3);
  });
});
