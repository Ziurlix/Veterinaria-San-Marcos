package com.example.cl.veterinariasanmarcos.service;

import com.example.cl.veterinariasanmarcos.model.Cita;
import com.example.cl.veterinariasanmarcos.model.Usuario;
import com.example.cl.veterinariasanmarcos.repository.CitaRepository;
import com.example.cl.veterinariasanmarcos.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CitaService citaService;

    @Test
    void clienteNoPuedeEditarCitaConMenosDeDosHorasDeAnticipacion() {
        Usuario usuario = new Usuario();
        usuario.setCorreo("cliente@ejemplo.cl");

        LocalDateTime citaCercana = LocalDateTime.now().plusHours(1);
        Cita existente = new Cita();
        existente.setId(1L);
        existente.setUsuario(usuario);
        existente.setFecha(citaCercana.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        existente.setHora(citaCercana.format(DateTimeFormatter.ofPattern("HH:mm")));
        when(citaRepository.findById(1L)).thenReturn(Optional.of(existente));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> citaService.actualizarCita(1L, usuario.getCorreo(), false, new Cita()));

        assertEquals(
                "Solo puedes editar una cita con al menos 2 horas de anticipación.",
                error.getMessage());
        verify(citaRepository, never()).save(existente);
    }

    @Test
    void administradorPuedeListarTodasLasCitas() {
        List<Cita> citas = List.of(cita(1L, "cliente@ejemplo.cl", "10/12/2030", "10:00"));
        when(citaRepository.findAll()).thenReturn(citas);

        List<Cita> resultado = citaService.listarPorUsuario("admin@ejemplo.cl", true);

        assertSame(citas, resultado);
        verify(citaRepository).findAll();
    }

    @Test
    void clienteListaSoloSusCitas() {
        List<Cita> citas = List.of(cita(1L, "cliente@ejemplo.cl", "10/12/2030", "10:00"));
        when(citaRepository.findByUsuarioCorreoIgnoreCase("cliente@ejemplo.cl")).thenReturn(citas);

        List<Cita> resultado = citaService.listarPorUsuario("cliente@ejemplo.cl", false);

        assertSame(citas, resultado);
        verify(citaRepository).findByUsuarioCorreoIgnoreCase("cliente@ejemplo.cl");
        verify(citaRepository, never()).findAll();
    }

    @Test
    void crearCitaAsociaAlUsuarioYLaDejaPendienteSinPagar() {
        Usuario usuario = usuario("cliente@ejemplo.cl");
        Cita datos = cita(null, null, "10/12/2030", "10:00");
        when(usuarioRepository.findByCorreoIgnoreCase(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(citaRepository.findAll()).thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cita creada = citaService.crearCita(usuario.getCorreo(), datos);

        assertSame(usuario, creada.getUsuario());
        assertEquals("Pendiente", creada.getEstado());
        assertFalse(creada.isPagado());
        verify(citaRepository).save(datos);
    }

    @Test
    void crearCitaFallaSiElUsuarioNoExiste() {
        when(usuarioRepository.findByCorreoIgnoreCase("noexiste@ejemplo.cl")).thenReturn(Optional.empty());

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> citaService.crearCita("noexiste@ejemplo.cl", cita(null, null, "10/12/2030", "10:00")));

        assertEquals("Usuario no encontrado.", error.getMessage());
        verify(citaRepository, never()).save(any(Cita.class));
    }

    @Test
    void crearCitaRechazaUnHorarioYaReservado() {
        Usuario usuario = usuario("cliente@ejemplo.cl");
        Cita existente = cita(1L, "otro@ejemplo.cl", "10/12/2030", "10:00");
        when(usuarioRepository.findByCorreoIgnoreCase(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(citaRepository.findAll()).thenReturn(List.of(existente));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> citaService.crearCita(
                        usuario.getCorreo(), cita(null, null, "10/12/2030", "10:00")));

        assertEquals("Ese horario ya se encuentra reservado. Elige otro.", error.getMessage());
        verify(citaRepository, never()).save(any(Cita.class));
    }

    @Test
    void horasOcupadasSoloIncluyeLaFechaSolicitadaYNoDuplicaHoras() {
        when(citaRepository.findAll()).thenReturn(List.of(
                cita(1L, "uno@ejemplo.cl", "10/12/2030", "10:00"),
                cita(2L, "dos@ejemplo.cl", "10/12/2030", "10:00"),
                cita(3L, "tres@ejemplo.cl", "10/12/2030", "11:00"),
                cita(4L, "cuatro@ejemplo.cl", "11/12/2030", "12:00")));

        List<String> horas = citaService.obtenerHorasOcupadas("10/12/2030");

        assertEquals(List.of("10:00", "11:00"), horas);
    }

    @Test
    void clienteNoPuedeEditarCitaDeOtroUsuario() {
        Cita existente = cita(1L, "dueno@ejemplo.cl", "10/12/2030", "10:00");
        when(citaRepository.findById(1L)).thenReturn(Optional.of(existente));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> citaService.actualizarCita(
                        1L, "otro@ejemplo.cl", false, cita(null, null, "11/12/2030", "11:00")));

        assertEquals("No tienes permiso para editar esta cita.", error.getMessage());
        verify(citaRepository, never()).save(any(Cita.class));
    }

    @Test
    void actualizarCitaRechazaUnHorarioOcupadoPorOtraCita() {
        Cita existente = cita(1L, "cliente@ejemplo.cl", "10/12/2030", "10:00");
        Cita otraCita = cita(2L, "otro@ejemplo.cl", "11/12/2030", "11:00");
        when(citaRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(citaRepository.findAll()).thenReturn(List.of(existente, otraCita));

        RuntimeException error = assertThrows(
                RuntimeException.class,
                () -> citaService.actualizarCita(
                        1L, "admin@ejemplo.cl", true, cita(null, null, "11/12/2030", "11:00")));

        assertEquals("Ese horario ya se encuentra reservado. Elige otro.", error.getMessage());
        verify(citaRepository, never()).save(any(Cita.class));
    }

    @Test
    void administradorPuedeActualizarDatosDeUnaCita() {
        Cita existente = cita(1L, "cliente@ejemplo.cl", "10/12/2030", "10:00");
        Cita datos = cita(null, null, "11/12/2030", "11:00");
        datos.setMascota("Luna");
        datos.setServicio("Vacunación");
        when(citaRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(citaRepository.findAll()).thenReturn(List.of(existente));
        when(citaRepository.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cita actualizada = citaService.actualizarCita(1L, "admin@ejemplo.cl", true, datos);

        assertEquals("Luna", actualizada.getMascota());
        assertEquals("Vacunación", actualizada.getServicio());
        assertEquals("11/12/2030", actualizada.getFecha());
        assertEquals("11:00", actualizada.getHora());
        assertEquals("cliente@ejemplo.cl", actualizada.getUsuario().getCorreo());
        verify(citaRepository).save(existente);
    }

    @Test
    void clientePuedeEliminarSuPropiaCita() {
        Cita existente = cita(1L, "cliente@ejemplo.cl", "10/12/2030", "10:00");
        when(citaRepository.findById(1L)).thenReturn(Optional.of(existente));

        citaService.eliminarCita(1L, "CLIENTE@ejemplo.cl", false);

        verify(citaRepository).delete(existente);
    }

    private static Usuario usuario(String correo) {
        Usuario usuario = new Usuario();
        usuario.setCorreo(correo);
        return usuario;
    }

    private static Cita cita(Long id, String correoUsuario, String fecha, String hora) {
        Cita cita = new Cita();
        cita.setId(id);
        cita.setUsuario(correoUsuario == null ? null : usuario(correoUsuario));
        cita.setMascota("Firulais");
        cita.setTipoMascota("Perro");
        cita.setCategoria("Consulta");
        cita.setServicio("Consulta general");
        cita.setFecha(fecha);
        cita.setHora(hora);
        cita.setMotivo("Control");
        return cita;
    }
}
