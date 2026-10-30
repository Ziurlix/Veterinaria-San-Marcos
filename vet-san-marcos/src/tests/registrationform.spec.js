import React from 'react';
import { render } from '@testing-library/react';
import RegistrationForm from '../components/RegistrationForm';

describe('Componente RegistrationForm', () => {
  it('debería cargar el formulario sin problemas', () => {
    const { container } = render(<RegistrationForm />);
    expect(container).toBeInTheDocument();
  });
});
