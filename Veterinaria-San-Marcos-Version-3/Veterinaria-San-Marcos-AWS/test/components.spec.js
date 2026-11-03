import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Navigation from '../src/components/Navbar';
import ProductList from '../src/components/ProductList';
import RegistrationForm from '../src/components/RegistrationForm';
import AppointmentForm from '../src/components/AppointmentForm';
import ShoppingCart from '../src/components/ShoppingCart';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

describe('Veterinaria San Marcos - 18 pruebas unitarias', () => {
  describe('Navbar - navegación', () => {
    it('01. Muestra el nombre de Veterinaria San Marcos', () => {
      render(<Navigation usuario={null} onLoginClick={() => {}} onAccountClick={() => {}} />);
      expect(screen.getByText(/Veterinaria San Marcos/)).toBeTruthy();
    });

    it('02. Muestra los cinco enlaces principales', () => {
      render(<Navigation usuario={null} onLoginClick={() => {}} onAccountClick={() => {}} />);
      ['Inicio', 'Nosotros', 'Servicios', 'Ubicación', 'Contacto'].forEach((name) => {
        expect(screen.getByRole('link', { name })).toBeTruthy();
      });
    });

    it('03. Ejecuta la acción de iniciar sesión cuando no hay usuario conectado', () => {
      const abrirLogin = jasmine.createSpy('abrirLogin');
      render(<Navigation usuario={null} onLoginClick={abrirLogin} onAccountClick={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
      expect(abrirLogin).toHaveBeenCalled();
    });
  });

  describe('ProductList - catálogo de servicios', () => {
    it('04. Muestra el título de la sección de servicios', () => {
      render(<ProductList onSolicitarServicio={() => {}} />);
      expect(screen.getByRole('heading', { name: 'Nuestros servicios' })).toBeTruthy();
    });

    it('05. Muestra los cinco servicios veterinarios', () => {
      render(<ProductList onSolicitarServicio={() => {}} />);
      ['Vacunación', 'Cirugía', 'Desparasitación', 'Exámenes clínicos', 'Procedimientos y Cuidados'].forEach((name) => {
        expect(screen.getByRole('heading', { name })).toBeTruthy();
      });
    });

    it('06. Muestra duración y precio referencial de los servicios', () => {
      render(<ProductList onSolicitarServicio={() => {}} />);
      expect(screen.getByText('~10 Minutos')).toBeTruthy();
      expect(screen.getByText('Desde $12.000 CLP')).toBeTruthy();
      expect(screen.getByText('Desde $50.000 CLP')).toBeTruthy();
    });
  });

  describe('RegistrationForm - registro de usuarios', () => {
    const completeValidRegistration = () => {
      fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Cristian Rain' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'cristian@example.com' } });
      fireEvent.change(screen.getByLabelText('Número de teléfono'), { target: { value: '912345678' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'secreto123' } });
      fireEvent.click(screen.getByLabelText('Acepto los términos y condiciones.'));
    };

    it('07. Rechaza el registro cuando los campos están vacíos', () => {
      render(<RegistrationForm show onClose={() => {}} onRegister={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      expect(screen.getByText('Ingresa tu nombre completo.')).toBeTruthy();
      expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
    });

    it('08. Valida el formato del correo y del teléfono', () => {
      render(<RegistrationForm show onClose={() => {}} onRegister={() => {}} />);
      fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Cristian Rain' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'correo-invalido' } });
      fireEvent.change(screen.getByLabelText('Número de teléfono'), { target: { value: '123' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'secreto123' } });
      fireEvent.click(screen.getByLabelText('Acepto los términos y condiciones.'));
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
      expect(screen.getByText('Ingresa un teléfono válido (9 o 10 dígitos).')).toBeTruthy();
    });

    it('09. Rechaza contraseñas que no coinciden', () => {
      render(<RegistrationForm show onClose={() => {}} onRegister={() => {}} />);
      completeValidRegistration();
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'otraClave' } });
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    });

    it('10. Envía los datos cuando el formulario es válido', () => {
      const register = jasmine.createSpy('register');
      render(<RegistrationForm show onClose={() => {}} onRegister={register} />);
      completeValidRegistration();
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      expect(register).toHaveBeenCalledWith({
        nombre: 'Cristian Rain',
        correo: 'cristian@example.com',
        telefono: '912345678',
        password: 'secreto123'
      });
    });
  });

  describe('AppointmentForm - solicitud de citas', () => {
    it('11. Muestra los campos necesarios para solicitar una cita', () => {
      render(<AppointmentForm show onClose={() => {}} onSubmit={() => {}} />);
      expect(screen.getByLabelText('Nombre de la mascota')).toBeTruthy();
      expect(screen.getByLabelText('Tipo de mascota')).toBeTruthy();
      expect(screen.getByLabelText('Servicio')).toBeTruthy();
      expect(screen.getByLabelText('Fecha')).toBeTruthy();
      expect(screen.getByLabelText('Horario (09:00 a 19:00)')).toBeTruthy();
      expect(screen.getByLabelText('Motivo de la consulta')).toBeTruthy();
    });

    it('12. Preselecciona el primer procedimiento de la categoría elegida', () => {
      render(<AppointmentForm show categoriaInicial="Vacunación" onClose={() => {}} onSubmit={() => {}} />);
      expect(screen.getByLabelText('Servicio').value).toBe('Vacuna antirrábica ($12.000)');
      expect(screen.getByText('Vacunación', { selector: 'strong' })).toBeTruthy();
    });

    it('13. Rechaza una fecha anterior a hoy', () => {
      render(<AppointmentForm show onClose={() => {}} onSubmit={() => {}} />);
      fireEvent.change(screen.getByLabelText('Nombre de la mascota'), { target: { value: 'Luna' } });
      fireEvent.change(screen.getByLabelText('Tipo de mascota'), { target: { value: 'Perro' } });
      fireEvent.change(screen.getByLabelText('Servicio'), { target: { value: 'Vacuna antirrábica ($12.000)' } });
      fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2000-01-01' } });
      fireEvent.change(screen.getByLabelText('Horario (09:00 a 19:00)'), { target: { value: '10:00' } });
      fireEvent.change(screen.getByLabelText('Motivo de la consulta'), { target: { value: 'Control anual' } });
      fireEvent.click(screen.getByRole('button', { name: 'Solicitar cita' }));
      expect(screen.getByText('La fecha de la cita no puede ser anterior a hoy.')).toBeTruthy();
    });

    it('14. Envía los datos de la cita cuando el formulario es válido', () => {
      const submit = jasmine.createSpy('submit');
      render(<AppointmentForm show onClose={() => {}} onSubmit={submit} />);
      fireEvent.change(screen.getByLabelText('Nombre de la mascota'), { target: { value: 'Luna' } });
      fireEvent.change(screen.getByLabelText('Tipo de mascota'), { target: { value: 'Perro' } });
      fireEvent.change(screen.getByLabelText('Servicio'), { target: { value: 'Vacuna antirrábica ($12.000)' } });
      fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2099-10-25' } });
      fireEvent.change(screen.getByLabelText('Horario (09:00 a 19:00)'), { target: { value: '10:30' } });
      fireEvent.change(screen.getByLabelText('Motivo de la consulta'), { target: { value: 'Control anual' } });
      fireEvent.click(screen.getByRole('button', { name: 'Solicitar cita' }));
      expect(submit).toHaveBeenCalledWith({
        mascota: 'Luna',
        tipoMascota: 'Perro',
        servicio: 'Vacuna antirrábica ($12.000)',
        fecha: '2099-10-25',
        hora: '10:30',
        motivo: 'Control anual'
      });
    });
  });

  describe('ShoppingCart - consulta y cancelación de citas', () => {
    const cita = {
      id: 101,
      servicio: 'Vacunación',
      mascota: 'Luna',
      tipoMascota: 'Perro',
      fecha: '2099-10-25',
      hora: '10:30',
      motivo: 'Control anual',
      estado: 'Pendiente'
    };

    it('15. Muestra un mensaje cuando no existen citas', () => {
      render(<ShoppingCart show onClose={() => {}} citas={[]} onCancelarCita={() => {}} />);
      expect(screen.getByText('No tienes citas registradas.')).toBeTruthy();
    });

    it('16. Muestra los datos principales de una cita', () => {
      render(<ShoppingCart show onClose={() => {}} citas={[cita]} onCancelarCita={() => {}} />);
      expect(screen.getByText(/Vacunación/)).toBeTruthy();
      expect(screen.getByText(/Luna/)).toBeTruthy();
      expect(screen.getByText(/Control anual/)).toBeTruthy();
      expect(screen.getByText('Pendiente')).toBeTruthy();
    });

    it('17. Solicita la cancelación de la cita seleccionada', () => {
      const cancelar = jasmine.createSpy('cancelar');
      render(<ShoppingCart show onClose={() => {}} citas={[cita]} onCancelarCita={cancelar} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar cita' }));
      expect(cancelar).toHaveBeenCalledWith(101);
    });

    it('18. Ejecuta la acción para cerrar la ventana de citas', () => {
      const close = jasmine.createSpy('close');
      render(<ShoppingCart show onClose={close} citas={[]} onCancelarCita={() => {}} />);
      fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
      expect(close).toHaveBeenCalled();
    });
  });
});
