import React from 'react';
import { render, screen } from '@testing-library/react';
import ShoppingCart from '../components/ShoppingCart';

describe('Componente ShoppingCart', () => {
  it('debería renderizar correctamente el componente', () => {
    const { container } = render(
      <ShoppingCart
        show={true}
        handleClose={jest.fn()}
        citas={[]}
        onCancelarCita={jest.fn()}
      />
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  it('debería contener una estructura válida', () => {
    const { container } = render(
      <ShoppingCart
        show={true}
        handleClose={jest.fn()}
        citas={[]}
        onCancelarCita={jest.fn()}
      />
    );
    expect(container.querySelector('.modal')).toBeTruthy();
  });
});
