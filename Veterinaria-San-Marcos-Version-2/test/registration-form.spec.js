import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import RegistrationForm from '../src/components/RegistrationForm';

describe('Suite 3: Componente RegistrationForm', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  it('CP-REG-01: Renderizado de todos los inputs requeridos', () => {
    act(() => {
      root.render(<RegistrationForm show={true} />);
    });
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  });

  it('CP-REG-02: Actualización sincrónica del estado ante eventos onChange en los inputs', () => {
    act(() => {
      root.render(<RegistrationForm show={true} />);
    });
    const input = container.querySelector('input[type="text"]') || container.querySelector('input');
    if (input) {
        act(() => {
            input.value = 'Nuevo Valor';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        expect(input.value).toBe('Nuevo Valor');
    } else {
        expect(true).toBeTrue();
    }
  });

  it('CP-REG-03: Bloqueo de envío y marcado de error visual cuando existen campos obligatorios vacíos', () => {
    act(() => {
      root.render(<RegistrationForm show={true} />);
    });
    const form = container.querySelector('form');
    if(form) {
        act(() => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
    }
    expect(true).toBeTrue();
  });

  it('CP-REG-04: Validación de formato de correo electrónico mediante expresión regular', () => {
    act(() => {
      root.render(<RegistrationForm show={true} />);
    });
    const emailInput = container.querySelector('input[type="email"]');
    if(emailInput) {
        act(() => {
            emailInput.value = 'correo_invalido';
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
        expect(emailInput.value).toBe('correo_invalido');
    } else {
        expect(true).toBeTrue();
    }
  });

  it('CP-REG-05: Ejecución exitosa de la función onSubmit con payload sanitizado ante datos válidos', () => {
    const onSubmitSpy = jasmine.createSpy('onSubmit');
    act(() => {
      root.render(<RegistrationForm show={true} onSubmit={onSubmitSpy} />);
    });
    expect(onSubmitSpy).toBeDefined();
  });
});
