import React from 'react';
import { render, screen } from '@testing-library/react';
import ShoppingCart from '../components/ShoppingCart';

describe('Componente ShoppingCart', () => {
  it('debería renderizar correctamente el componente', () => {
    const { container } = render(<ShoppingCart citas={[]} />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('debería contener una estructura válida', () => {
    const { container } = render(<ShoppingCart />);
    expect(container.firstChild).toHaveClass('container'); // Asumiendo que usas <Container> de Bootstrap
  });
});

