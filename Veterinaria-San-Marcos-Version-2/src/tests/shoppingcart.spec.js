import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShoppingCart from '../components/ShoppingCart';

describe('Componente ShoppingCart', () => {
  it('debería renderizar correctamente el componente', () => {
    render(
      <ShoppingCart
        show={true}
        handleClose={jest.fn()}
        citas={[]}
        onCancelarCita={jest.fn()}
      />
    );

    expect(screen.getByText(/Mis Citas Agendadas/i)).toBeInTheDocument();
  });

  it('debería contener una estructura válida', () => {
    render(
      <ShoppingCart
        show={true}
        handleClose={jest.fn()}
        citas={[]}
        onCancelarCita={jest.fn()}
      />
    );

    expect(document.body.querySelector('.modal')).toBeInTheDocument();
  });
});
