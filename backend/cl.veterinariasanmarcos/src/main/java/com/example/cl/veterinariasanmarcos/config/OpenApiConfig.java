package com.example.cl.veterinariasanmarcos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI veterinariaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Veterinaria San Marcos")
                        .description("""
                                API para registro e inicio de sesión, gestión de citas y pagos Webpay Plus.
                                Las rutas de citas y pagos requieren un token JWT Bearer, salvo la consulta
                                pública de horarios ocupados.
                                """)
                        .version("v1"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingresa el token recibido en /api/v1/auth/login.")));
    }
}
