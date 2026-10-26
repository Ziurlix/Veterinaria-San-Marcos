import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ShoppingCart from '../src/components/ShoppingCart';

describe('Suite 4: Componente ShoppingCart', () => {
  const citasMock = [
    { id: 1, servicio: 'Consulta', mascota: 'Fido', tipoMascota: 'Perro', hora: '10:00', fecha: '2026-10-25', motivo: 'Control' }
  ];

  afterEach(() => {
    cleanup();
  });

  it('CP-CRT-01: Despliegue de mensaje de lista vacía cuando no existen citas registradas', async () => {
    render(<ShoppingCart show={true} handleClose={() => {}} citas={[]} onCancelarCita={() => {}} />);
    expect(await screen.findByText(/No tienes citas registradas actualmente/i)).toBeTruthy();
  });

  it('CP-CRT-02: Renderizado de filas de servicios seleccionados con detalle de mascota y hora', () => {
    render(<ShoppingCart show={true} handleClose={() => {}} citas={citasMock} onCancelarCita={() => {}} />);
    expect(screen.getByText(/Consulta/i)).toBeTruthy();
    expect(screen.getByText(/Fido/i)).toBeTruthy();
  });

  it('CP-CRT-03: Cálculo aritmético exacto del subtotal y total referencial de los servicios', () => {
    const citasPreciosMock = [
      { id: 1, servicio: 'Consulta', mascota: 'Fido', precio: 15000 },
      { id: 2, servicio: 'Vacuna', mascota: 'Luna', precio: 10000 }
    ];
    
    render(<ShoppingCart show={true} handleClose={() => {}} citas={citasPreciosMock} onRemoveItem={() => {}} />);
    expect(screen.getByText(/25000/i)).toBeTruthy(); 
  });

  it('CP-CRT-04: Disparo de evento de anulación/eliminación al presionar botón cancelar', () => {
    const cancelarSpy = jasmine.createSpy('onCancelarCita');
    render(<ShoppingCart show={true} handleClose={() => {}} citas={citasMock} onCancelarCita={cancelarSpy} />);
    
    const btnCancelar = screen.getByRole('button', { name: /Cancelar cita/i });
    fireEvent.click(btnCancelar);
    expect(cancelarSpy).toHaveBeenCalledWith(1);
  });
});