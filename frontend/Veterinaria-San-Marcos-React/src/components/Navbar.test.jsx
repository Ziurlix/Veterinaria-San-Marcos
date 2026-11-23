import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../context/AppContext';
import Navbar from './Navbar';

const renderNavbar = (usuarioLogueado = false) => {
  const { container } = render(
    <MemoryRouter>
      <AppContext.Provider value={{ usuarioLogueado }}>
        <Navbar />
      </AppContext.Provider>
    </MemoryRouter>
  );
  return container;
};

describe('barra de navegación', () => {
  beforeEach(() => {
    delete window.bootstrap;
  });

  it('cambia entre modo oscuro y claro y guarda la preferencia', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo oscuro' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(localStorage.getItem('tema')).toBe('oscuro');
    expect(screen.getByRole('button', { name: 'Activar modo claro' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(localStorage.getItem('tema')).toBe('claro');
  });

  it('restaura el modo oscuro guardado y muestra la acción de cuenta correcta', () => {
    localStorage.setItem('tema', 'oscuro');
    renderNavbar(true);

    expect(screen.getByRole('button', { name: 'Activar modo claro' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /Mi cuenta/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
  });

  it('cierra el menú móvil al navegar con el enlace de marca', () => {
    const hide = vi.fn();
    const container = renderNavbar();
    const menu = container.querySelector('#menuPrincipal');
    menu.classList.add('show');
    window.bootstrap = {
      Collapse: {
        getOrCreateInstance: vi.fn(() => ({ hide }))
      }
    };

    fireEvent.click(screen.getByRole('link', { name: /Veterinaria San Marcos/ }));

    expect(window.bootstrap.Collapse.getOrCreateInstance).toHaveBeenCalledWith(menu);
    expect(hide).toHaveBeenCalled();
  });
});
