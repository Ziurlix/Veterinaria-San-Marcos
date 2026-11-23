package com.example.cl.veterinariasanmarcos.repository;

import com.example.cl.veterinariasanmarcos.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    Optional<Cita> findByIdAndUsuarioCorreoIgnoreCase(Long id, String correo);
    Optional<Cita> findByBuyOrderAndUsuarioCorreoIgnoreCase(String buyOrder, String correo);
    List<Cita> findByUsuarioCorreoIgnoreCase(String correo);
}