import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import App from '../src/App';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('Suite: App (Componente Principal) - Flujos Principales y Validaciones', () => {
  
  it('CP-APP-01: Renderiza la aplicación base sin caerse', () => {
    render(<App />);
    const elementos = screen.getAllByText(/Veterinaria San Marcos/i);
    expect(elementos.length).toBeGreaterThan(0);
  });

  it('CP-APP-02: Abre el modal de registro al hacer clic en Registrarse', () => {
    render(<App />);
    const btnRegistro = screen.getAllByRole('button', { name: /Registrarse/i })[0];
    fireEvent.click(btnRegistro);
    expect(screen.getByText(/Crear cuenta/i)).toBeTruthy();
  });

  it('CP-APP-03: Rechaza el inicio de sesión con credenciales inválidas', async () => {
    render(<App />);
    const btnLoginNav = screen.getAllByRole('button', { name: /Iniciar sesión/i })[0];
    fireEvent.click(btnLoginNav);
    
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'fantasma@correo.cl' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123456' } });
    
    // Disparamos el submit directo al formulario para evitar bloqueos HTML5
    const btnModalLogin = screen.getAllByRole('button', { name: /Iniciar sesión/i }).pop();
    fireEvent.submit(btnModalLogin.closest('form')); 
    
    expect(await screen.findByText(/Credenciales incorrectas o usuario no registrado/i)).toBeTruthy();
  });

  it('CP-APP-04: Simula el inicio de sesión exitoso y cierre de sesión', async () => {
    localStorage.setItem('usuarioVeterinaria', JSON.stringify({
      correo: 'test@test.com',
      password: 'password123'
    }));
    
    render(<App />);
    
    const btnLoginNav = screen.getAllByRole('button', { name: /Iniciar sesión/i })[0];
    fireEvent.click(btnLoginNav);
    
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
    
    const btnModalLogin = screen.getAllByRole('button', { name: /Iniciar sesión/i }).pop();
    fireEvent.submit(btnModalLogin.closest('form'));
    
    const btnSalir = await screen.findByRole('button', { name: /Salir/i });
    expect(btnSalir).toBeTruthy();
    
    fireEvent.click(btnSalir);
  });

  it('CP-APP-05: Bloquea y permite la creación de citas según validaciones', async () => {
    localStorage.setItem('usuarioVeterinaria', JSON.stringify({ correo: 'test@test.com', password: '123' }));
    
    render(<App />);
    
    fireEvent.click(screen.getAllByRole('button', { name: /Iniciar sesión/i })[0]);
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123' } });
    
    const btnModalLogin = screen.getAllByRole('button', { name: /Iniciar sesión/i }).pop();
    fireEvent.submit(btnModalLogin.closest('form'));
    
    await screen.findByRole('button', { name: /Salir/i });
    
    const botonesCita = screen.getAllByRole('button', { name: /Solicitar cita/i });
    fireEvent.click(botonesCita[0]);
    expect(await screen.findByText(/📅 Solicitar una cita/i)).toBeTruthy();
    
    fireEvent.change(screen.getByLabelText(/Nombre de la mascota/i), { target: { value: 'Fido' } });
    fireEvent.change(screen.getByLabelText(/Tipo de mascota/i), { target: { value: 'Perro' } });
    fireEvent.change(screen.getByLabelText(/^Servicio$/i), { target: { value: 'Vacuna antirrábica ($12.000)' } });
    fireEvent.change(screen.getByLabelText(/Motivo de la consulta/i), { target: { value: 'Control de rutina' } });
    
    const btnSolicitar = screen.getAllByRole('button', { name: /Solicitar cita/i }).pop();
    const formCita = btnSolicitar.closest('form');

    // 1. Forzamos error: Fecha en el pasado
    fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2020-01-01' } });
    fireEvent.change(screen.getByLabelText(/Horario/i), { target: { value: '10:00' } });
    fireEvent.submit(formCita);
    expect(await screen.findByText(/La fecha de la cita no puede estar en el pasado/i)).toBeTruthy();

    // 2. Forzamos error: Domingo (1 de Noviembre 2026)
    fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2026-11-01' } });
    fireEvent.submit(formCita);
    expect(await screen.findByText(/La clínica no atiende los domingos/i)).toBeTruthy();

    // 3. Forzamos error: Horario fuera de rango (Sábado a las 08:00)
    fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2026-10-31' } }); 
    fireEvent.change(screen.getByLabelText(/Horario/i), { target: { value: '08:00' } });
    fireEvent.submit(formCita);
    expect(await screen.findByText(/El horario de atención es de 09:00 a 19:00/i)).toBeTruthy();

    // 4. Flujo exitoso para cerrar con todo en verde
    fireEvent.change(screen.getByLabelText(/Horario/i), { target: { value: '10:00' } });
    fireEvent.submit(formCita);
    expect(await screen.findByText(/La solicitud de cita se guardó correctamente/i)).toBeTruthy();
  });
});