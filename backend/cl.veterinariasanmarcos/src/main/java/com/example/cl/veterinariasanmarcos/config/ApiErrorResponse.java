package com.example.cl.veterinariasanmarcos.config;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta de error de la API.")
public record ApiErrorResponse(
        @Schema(description = "Descripción del error.", example = "La solicitud no es válida.")
        String mensaje
) {}
