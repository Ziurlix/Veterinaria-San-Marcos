package com.example.cl.veterinariasanmarcos.controller;

import com.example.cl.veterinariasanmarcos.model.Cita;
import com.example.cl.veterinariasanmarcos.service.CitaService;
import com.example.cl.veterinariasanmarcos.config.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/citas")
@Tag(name = "Citas", description = "Consulta y administración de las citas veterinarias.")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    public record CitaRequest(
            @Schema(description = "Nombre de la mascota.", example = "Luna",
                    requiredMode = Schema.RequiredMode.REQUIRED) String mascota,
            @Schema(description = "Especie de la mascota.", example = "Gato",
                    allowableValues = {"Perro", "Gato", "Conejo", "Ave"},
                    requiredMode = Schema.RequiredMode.REQUIRED) String tipoMascota,
            @Schema(description = "Categoría del servicio.", example = "Consulta General",
                    requiredMode = Schema.RequiredMode.REQUIRED) String categoria,
            @Schema(description = "Servicio seleccionado; incluye el precio en CLP.",
                    example = "Consulta general ($15.000)",
                    requiredMode = Schema.RequiredMode.REQUIRED) String servicio,
            @Schema(description = "Fecha en formato dd/MM/yyyy.", example = "25/11/2026",
                    requiredMode = Schema.RequiredMode.REQUIRED) String fecha,
            @Schema(description = "Hora disponible en formato HH:mm.", example = "11:00",
                    requiredMode = Schema.RequiredMode.REQUIRED) String hora,
            @Schema(description = "Motivo o información adicional.", example = "Control preventivo")
            String motivo
    ) {}

    public record CitaResponse(
            @Schema(example = "42") Long id,
            @Schema(description = "Correo del dueño de la cita.", example = "ana@example.cl") String usuario,
            @Schema(example = "Luna") String mascota,
            @Schema(example = "Gato") String tipoMascota,
            @Schema(example = "Consulta General") String categoria,
            @Schema(example = "Consulta general ($15.000)") String servicio,
            @Schema(example = "25/11/2026") String fecha,
            @Schema(example = "11:00") String hora,
            @Schema(example = "Control preventivo") String motivo,
            @Schema(example = "Pendiente") String estado,
            @Schema(example = "false") boolean pagado,
            @Schema(example = "TX-123456") String transaccion
    ) {
        static CitaResponse from(Cita c) {
            return new CitaResponse(
                    c.getId(),
                    c.getUsuario().getCorreo(),
                    c.getMascota(),
                    c.getTipoMascota(),
                    c.getCategoria(),
                    c.getServicio(),
                    c.getFecha(),
                    c.getHora(),
                    c.getMotivo(),
                    c.getEstado(),
                    c.isPagado(),
                    c.getTransaccion()
            );
        }
    }

    private boolean esAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR")
                        || a.getAuthority().equals("ROLE_VENDEDOR"));
    }

    @GetMapping
    @Operation(summary = "Listar citas", description = "Devuelve las citas del usuario autenticado. Los roles administrativos pueden consultar todas las citas.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Lista de citas.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = CitaResponse[].class),
                    examples = @ExampleObject(value = """
                            [{"id":42,"usuario":"ana@example.cl","mascota":"Luna","tipoMascota":"Gato","categoria":"Consulta General","servicio":"Consulta general ($15.000)","fecha":"25/11/2026","hora":"11:00","motivo":"Control preventivo","estado":"Pendiente","pagado":false,"transaccion":null}]
                            """)))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    public List<CitaResponse> listar(@Parameter(hidden = true) Authentication auth) {
        return citaService.listarPorUsuario(auth.getName(), esAdmin(auth))
                .stream()
                .map(CitaResponse::from)
                .toList();
    }

    @GetMapping("/ocupadas")
    @Operation(summary = "Consultar horarios ocupados", description = "Ruta pública. Devuelve las horas reservadas para una fecha; el cliente debe ocultar también las horas pasadas.")
    @ApiResponse(responseCode = "200", description = "Horas ocupadas en formato HH:mm.",
            content = @Content(mediaType = "application/json",
                    examples = @ExampleObject(value = "[\"09:30\",\"11:00\",\"15:00\"]")))
    @ApiResponse(responseCode = "400", description = "Falta el parámetro obligatorio fecha.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    public List<String> listarHorasOcupadas(
            @Parameter(description = "Fecha a consultar en formato dd/MM/yyyy.",
                    example = "25/11/2026", required = true)
            @RequestParam String fecha
    ) {
        return citaService.obtenerHorasOcupadas(fecha);
    }

    @PostMapping
    @Operation(summary = "Crear cita", description = "Crea una cita para el usuario autenticado y devuelve el registro guardado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "201", description = "Cita creada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = CitaResponse.class),
                    examples = @ExampleObject(value = """
                            {"id":42,"usuario":"ana@example.cl","mascota":"Luna","tipoMascota":"Gato","categoria":"Consulta General","servicio":"Consulta general ($15.000)","fecha":"25/11/2026","hora":"11:00","motivo":"Control preventivo","estado":"Pendiente","pagado":false,"transaccion":null}
                            """)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos, fecha pasada o horario ocupado.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class),
                    examples = @ExampleObject(value = "{\"mensaje\":\"El horario ya se encuentra reservado.\"}")))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    public ResponseEntity<?> crear(
            @RequestBody(
                    description = "Datos de la cita solicitada.",
                    content = @Content(examples = @ExampleObject(value = """
                            {"mascota":"Luna","tipoMascota":"Gato","categoria":"Consulta General","servicio":"Consulta general ($15.000)","fecha":"25/11/2026","hora":"11:00","motivo":"Control preventivo"}
                            """))
            ) @org.springframework.web.bind.annotation.RequestBody CitaRequest req,
            @Parameter(hidden = true) Authentication auth
    ) {
        try {
            Cita cita = new Cita();
            cita.setMascota(req.mascota());
            cita.setTipoMascota(req.tipoMascota());
            cita.setCategoria(req.categoria());
            cita.setServicio(req.servicio());
            cita.setFecha(req.fecha());
            cita.setHora(req.hora());
            cita.setMotivo(req.motivo());

            Cita guardada = citaService.crearCita(auth.getName(), cita);
            return ResponseEntity.status(201).body(CitaResponse.from(guardada));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cita", description = "Actualiza una cita propia. Los roles administrativos también pueden editar citas de otros usuarios.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Cita actualizada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = CitaResponse.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos, horario ocupado o cita no editable.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    public ResponseEntity<?> actualizar(
            @Parameter(description = "ID de la cita a actualizar.", example = "42")
            @PathVariable Long id,
            @RequestBody(
                    description = "Nuevos datos de la cita.",
                    content = @Content(examples = @ExampleObject(value = """
                            {"mascota":"Luna","tipoMascota":"Gato","categoria":"Consulta General","servicio":"Consulta general ($15.000)","fecha":"26/11/2026","hora":"11:30","motivo":"Control preventivo"}
                            """))
            ) @org.springframework.web.bind.annotation.RequestBody CitaRequest req,
            @Parameter(hidden = true) Authentication auth
    ) {
        try {
            Cita cita = new Cita();
            cita.setMascota(req.mascota());
            cita.setTipoMascota(req.tipoMascota());
            cita.setCategoria(req.categoria());
            cita.setServicio(req.servicio());
            cita.setFecha(req.fecha());
            cita.setHora(req.hora());
            cita.setMotivo(req.motivo());

            Cita actualizada = citaService.actualizarCita(id, auth.getName(), esAdmin(auth), cita);
            return ResponseEntity.ok(CitaResponse.from(actualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cita", description = "Elimina una cita propia. Los roles administrativos también pueden eliminar citas de otros usuarios.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "204", description = "Cita eliminada; no se devuelve contenido.")
    @ApiResponse(responseCode = "400", description = "La cita no existe o no puede eliminarse.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    public ResponseEntity<?> eliminar(
            @Parameter(description = "ID de la cita a eliminar.", example = "42")
            @PathVariable Long id,
            @Parameter(hidden = true) Authentication auth
    ) {
        try {
            citaService.eliminarCita(id, auth.getName(), esAdmin(auth));
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}