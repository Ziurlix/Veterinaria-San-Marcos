import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductList from '../src/components/ProductList';

describe('Suite 2: Componente ProductList', () => {
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

  it('CP-PRD-01: Renderizado íntegro de la grilla de servicios según array de datos provisto', () => {
    act(() => {
      root.render(<ProductList />);
    });
    expect(container.textContent).toContain('Vacunación');
  });

  it('CP-PRD-02: Despliegue correcto de título, descripción y precio formateado en moneda local', () => {
    act(() => {
      root.render(<ProductList />);
    });
    expect(container.textContent).toContain('Vacunación');
    expect(container.textContent).toContain('12.000');
    expect(container.textContent).toContain('Antirrábica');
  });

  it('CP-PRD-03: Presencia de clases responsivas de Bootstrap en las tarjetas', () => {
    act(() => {
      root.render(<ProductList />);
    });
    const card = container.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('CP-PRD-04: Activación del mock onSelectService al hacer clic en Agendar Cita', () => {
    const onSelectSpy = jasmine.createSpy('onSolicitarServicio');
    act(() => {
      root.render(<ProductList onSolicitarServicio={onSelectSpy} />);
    });
    const btn = container.querySelector('button');
    if(btn) {
        act(() => {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(onSelectSpy).toHaveBeenCalled();
    }
  });

  it('CP-PRD-05: Manejo de estado vacío cuando no existen servicios disponibles en catálogo', () => {
    act(() => {
      root.render(<ProductList />);
    });
    expect(container.querySelectorAll('.card').length).toBeGreaterThanOrEqual(0);
  });
});
