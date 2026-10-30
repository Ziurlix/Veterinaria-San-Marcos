import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductList from '../components/ProductList';

describe('Componente ProductList', () => {
  it('debería renderizar el título de productos', () => {
    render(<ProductList />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('debería tener contenido válido', () => {
    const { container } = render(<ProductList />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
