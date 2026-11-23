package com.example.cl.veterinariasanmarcos.service;

import com.example.cl.veterinariasanmarcos.model.Cita;
import com.example.cl.veterinariasanmarcos.model.Usuario;
import com.example.cl.veterinariasanmarcos.repository.CitaRepository;
import com.example.cl.veterinariasanmarcos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;

    public CitaService(CitaRepository citaRepository, UsuarioRepository usuarioRepository) {
        this.citaRepository = citaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Cita> listarPorUsuario(String correo, boolean esAdmin) {
        if (esAdmin) {
            return citaRepository.findAll();
        }
        return citaRepository.findByUsuarioCorreoIgnoreCase(correo);
    }

    public Cita crearCita(String correoUsuario, Cita datos) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        boolean choque = citaRepository.findAll().stream()
                .anyMatch(c -> c.getFecha().equals(datos.getFecha()) && c.getHora().equals(datos.getHora()));

        if (choque) {
            throw new RuntimeException("Ese horario ya se encuentra reservado. Elige otro.");
        }

        datos.setUsuario(usuario);
        datos.setEstado("Pendiente");
        datos.setPagado(false);
        return citaRepository.save(datos);
    }

    public List<String> obtenerHorasOcupadas(String fecha) {
        return citaRepository.findAll().stream()
                .filter(c -> fecha.equals(c.getFecha()))
                .map(Cita::getHora)
                .distinct()
                .toList();
    }

    public Cita actualizarCita(Long id, String correoUsuario, boolean esAdmin, Cita datos) {
        Cita existente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada."));

        if (!esAdmin && !existente.getUsuario().getCorreo().equalsIgnoreCase(correoUsuario)) {
            throw new RuntimeException("No tienes permiso para editar esta cita.");
        }

        if (!esAdmin) {
            DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            LocalDateTime fechaHoraCita = LocalDateTime.parse(
                    existente.getFecha() + " " + existente.getHora(), formato);
            long horasRestantes = ChronoUnit.HOURS.between(LocalDateTime.now(), fechaHoraCita);

            if (horasRestantes < 2) {
                throw new RuntimeException("Solo puedes editar una cita con al menos 2 horas de anticipación.");
            }
        }

        boolean choque = citaRepository.findAll().stream()
                .anyMatch(c -> !c.getId().equals(id)
                        && c.getFecha().equals(datos.getFecha())
                        && c.getHora().equals(datos.getHora()));

        if (choque) {
            throw new RuntimeException("Ese horario ya se encuentra reservado. Elige otro.");
        }

        existente.setMascota(datos.getMascota());
        existente.setTipoMascota(datos.getTipoMascota());
        existente.setCategoria(datos.getCategoria());
        existente.setServicio(datos.getServicio());
        existente.setFecha(datos.getFecha());
        existente.setHora(datos.getHora());
        existente.setMotivo(datos.getMotivo());

        return citaRepository.save(existente);
    }

    public void eliminarCita(Long id, String correoUsuario, boolean esAdmin) {
        Cita existente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada."));

        if (!esAdmin && !existente.getUsuario().getCorreo().equalsIgnoreCase(correoUsuario)) {
            throw new RuntimeException("No tienes permiso para eliminar esta cita.");
        }

        citaRepository.delete(existente);
    }
}