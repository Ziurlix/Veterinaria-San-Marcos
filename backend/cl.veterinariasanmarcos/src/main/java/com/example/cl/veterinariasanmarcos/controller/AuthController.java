package com.example.cl.veterinariasanmarcos.controller;

import com.example.cl.veterinariasanmarcos.model.Rol;
import com.example.cl.veterinariasanmarcos.model.Usuario;
import com.example.cl.veterinariasanmarcos.repository.UsuarioRepository;
import com.example.cl.veterinariasanmarcos.security.JwtService;
import com.example.cl.veterinariasanmarcos.config.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Registro de usuarios e inicio de sesión.")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record RegistroRequest(
            @Schema(description = "Nombre completo del usuario.", example = "Ana Pérez",
                    requiredMode = Schema.RequiredMode.REQUIRED) String nombre,
            @Schema(description = "Correo usado para iniciar sesión.", example = "ana@example.cl",
                    format = "email", requiredMode = Schema.RequiredMode.REQUIRED) String correo,
            @Schema(description = "Teléfono de contacto.", example = "912345678",
                    requiredMode = Schema.RequiredMode.REQUIRED) String telefono,
            @Schema(description = "Contraseña. Se almacena cifrada.", example = "clave-segura",
                    format = "password", requiredMode = Schema.RequiredMode.REQUIRED) String password
    ) {}

    public record LoginRequest(
            @Schema(description = "Correo registrado.", example = "ana@example.cl",
                    format = "email", requiredMode = Schema.RequiredMode.REQUIRED) String correo,
            @Schema(description = "Contraseña de la cuenta.", example = "clave-segura",
                    format = "password", requiredMode = Schema.RequiredMode.REQUIRED) String password
    ) {}

    public record LoginUsuarioResponse(
            @Schema(example = "12") Long id,
            @Schema(example = "Ana Pérez") String nombre,
            @Schema(example = "ana@example.cl") String correo,
            @Schema(example = "912345678") String telefono,
            @Schema(example = "CLIENTE") String rol
    ) {}

    public record LoginResponse(
            @Schema(description = "JWT para usar como Bearer en rutas protegidas.", example = "eyJhbGciOiJIUzI1NiJ9...")
            String token,
            LoginUsuarioResponse usuario
    ) {}

    @PostMapping("/registro")
    @Operation(summary = "Registrar usuario", description = "Crea una cuenta nueva con el rol CLIENTE.")
    @ApiResponse(responseCode = "201", description = "Cuenta creada correctamente.",
            content = @Content(mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"mensaje\":\"Usuario registrado correctamente.\"}")))
    @ApiResponse(responseCode = "400", description = "El correo ya está registrado.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class),
                    examples = @ExampleObject(value = "{\"mensaje\":\"Este correo ya está registrado.\"}")))
    public ResponseEntity<?> registrar(
            @RequestBody(
                    description = "Datos para crear la cuenta.",
                    content = @Content(examples = @ExampleObject(value = """
                            {"nombre":"Ana Pérez","correo":"ana@example.cl","telefono":"912345678","password":"clave-segura"}
                            """))
            ) @org.springframework.web.bind.annotation.RequestBody RegistroRequest req
    ) {
        if (usuarioRepository.findByCorreoIgnoreCase(req.correo()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Este correo ya está registrado."));
        }

        Usuario nuevo = new Usuario();
        nuevo.setNombre(req.nombre());
        nuevo.setCorreo(req.correo().toLowerCase());
        nuevo.setTelefono(req.telefono());
        nuevo.setPassword(passwordEncoder.encode(req.password()));
        nuevo.setRol(Rol.CLIENTE);

        usuarioRepository.save(nuevo);
        return ResponseEntity.status(201).body(Map.of("mensaje", "Usuario registrado correctamente."));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida las credenciales y devuelve un JWT para las rutas protegidas.")
    @ApiResponse(responseCode = "200", description = "Autenticación exitosa.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = LoginResponse.class),
                    examples = @ExampleObject(value = """
                            {"token":"eyJhbGciOiJIUzI1NiJ9...","usuario":{"id":12,"nombre":"Ana Pérez","correo":"ana@example.cl","telefono":"912345678","rol":"CLIENTE"}}
                            """)))
    @ApiResponse(responseCode = "401", description = "Correo o contraseña incorrectos.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class),
                    examples = @ExampleObject(value = "{\"mensaje\":\"Correo o contraseña incorrectos.\"}")))
    public ResponseEntity<?> login(
            @RequestBody(
                    description = "Credenciales de una cuenta registrada.",
                    content = @Content(examples = @ExampleObject(value = """
                            {"correo":"ana@example.cl","password":"clave-segura"}
                            """))
            ) @org.springframework.web.bind.annotation.RequestBody LoginRequest req
    ) {
        var optUser = usuarioRepository.findByCorreoIgnoreCase(req.correo());
        if (optUser.isEmpty() || !passwordEncoder.matches(req.password(), optUser.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("mensaje", "Correo o contraseña incorrectos."));
        }

        Usuario user = optUser.get();
        String token = jwtService.generarToken(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "usuario", Map.of(
                        "id", user.getId(),
                        "nombre", user.getNombre(),
                        "correo", user.getCorreo(),
                        "telefono", user.getTelefono(),
                        "rol", user.getRol().name()
                )
        ));
    }
}