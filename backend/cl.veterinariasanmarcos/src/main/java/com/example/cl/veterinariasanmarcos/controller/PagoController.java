package com.example.cl.veterinariasanmarcos.controller;

import cl.transbank.common.IntegrationApiKeys;
import cl.transbank.common.IntegrationCommerceCodes;
import cl.transbank.webpay.exception.TransactionCommitException;
import cl.transbank.webpay.exception.TransactionCreateException;
import cl.transbank.webpay.exception.TransactionStatusException;
import cl.transbank.webpay.exception.TransbankHttpApiException;
import cl.transbank.webpay.webpayplus.WebpayPlus;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionStatusResponse;
import com.example.cl.veterinariasanmarcos.config.ApiErrorResponse;
import com.example.cl.veterinariasanmarcos.model.Cita;
import com.example.cl.veterinariasanmarcos.repository.CitaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pagos")
@Tag(name = "Pagos", description = "Inicio y confirmación de pagos con Transbank Webpay Plus.")
public class PagoController {

    private static final Logger logger = LoggerFactory.getLogger(PagoController.class);
    private static final Pattern MONTO_SERVICIO = Pattern.compile("\\$\\s*([\\d.]+)");

    private final CitaRepository citaRepository;
    private final WebpayPlus.Transaction transbankTransaction;
    private final String returnUrl;

    public record IniciarPagoRequest(
            @Schema(description = "Identificador de la cita pendiente de pago.", example = "42",
                    requiredMode = Schema.RequiredMode.REQUIRED) Long idCita
    ) {}

    public record ConfirmarPagoRequest(
            @Schema(description = "Token de transacción entregado por Webpay al volver al comercio.",
                    example = "abc123-token-webpay",
                    requiredMode = Schema.RequiredMode.REQUIRED) String tokenWs
    ) {}

    public record IniciarPagoResponse(
            @Schema(description = "URL de Webpay a la que debe redirigirse el navegador.",
                    example = "https://webpay3gint.transbank.cl/webpayserver/initTransaction")
            String url,
            @Schema(description = "Token de la transacción; se envía a Webpay como token_ws.",
                    example = "abc123-token-webpay") String token,
            @Schema(description = "Orden de compra asociada al pago.", example = "C16-AB12CD34")
            String buyOrder
    ) {}

    public record ConfirmarPagoResponse(
            @Schema(example = "true") boolean aprobado,
            @Schema(example = "42") Long idCita,
            @Schema(description = "Código de autorización o referencia de la compra.",
                    example = "123456") String authorizationCode,
            @Schema(example = "C16-AB12CD34") String buyOrder,
            @Schema(description = "Monto confirmado en pesos chilenos.", example = "15000")
            Integer monto
    ) {}

    public PagoController(
            CitaRepository citaRepository,
            @Value("${transbank.environment:integration}") String transbankEnvironment,
            @Value("${transbank.production-enabled:false}") boolean productionEnabled,
            @Value("${transbank.commerce-code:}") String commerceCode,
            @Value("${transbank.api-key:}") String apiKey,
            @Value("${transbank.return-url:http://localhost:5173/pago-retorno}") String returnUrl
    ) {
        this.citaRepository = citaRepository;
        this.transbankTransaction = crearTransaccion(
                transbankEnvironment,
                productionEnabled,
                commerceCode,
                apiKey,
                returnUrl
        );
        this.returnUrl = returnUrl;
    }

    private WebpayPlus.Transaction crearTransaccion(
            String environment,
            boolean productionEnabled,
            String commerceCode,
            String apiKey,
            String returnUrl
    ) {
        if ("integration".equalsIgnoreCase(environment)) {
            logger.info("Transbank configurado en ambiente de integración");
            return WebpayPlus.Transaction.buildForIntegration(
                    IntegrationCommerceCodes.WEBPAY_PLUS,
                    IntegrationApiKeys.WEBPAY
            );
        }

        if (!"production".equalsIgnoreCase(environment)) {
            throw new IllegalStateException("TRANSBANK_ENVIRONMENT debe ser integration o production.");
        }
        if (!productionEnabled) {
            throw new IllegalStateException(
                    "Producción de Transbank requiere TRANSBANK_PRODUCTION_ENABLED=true."
            );
        }
        if (commerceCode.isBlank() || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Producción de Transbank requiere TRANSBANK_COMMERCE_CODE y TRANSBANK_API_KEY."
            );
        }
        if (!returnUrl.startsWith("https://")) {
            throw new IllegalStateException("La URL de retorno de producción debe usar HTTPS.");
        }

        logger.warn("Transbank configurado en producción.");
        return WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
    }

    @PostMapping("/iniciar")
    @Operation(summary = "Iniciar pago", description = "Crea una transacción Webpay para una cita propia pendiente. La respuesta contiene la URL y el token para redirigir el navegador.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Transacción creada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = IniciarPagoResponse.class),
                    examples = @ExampleObject(value = """
                            {"url":"https://webpay3gint.transbank.cl/webpayserver/initTransaction","token":"abc123-token-webpay","buyOrder":"C16-AB12CD34"}
                            """)))
    @ApiResponse(responseCode = "400", description = "ID inválido o no se pudo determinar el monto del servicio.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    @ApiResponse(responseCode = "404", description = "La cita no existe o no pertenece al usuario.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "La cita ya fue pagada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "502", description = "Transbank no pudo iniciar la transacción.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    public ResponseEntity<?> iniciarPago(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Cita pendiente que se desea pagar.",
                    content = @Content(examples = @ExampleObject(value = "{\"idCita\":42}"))
            ) @RequestBody IniciarPagoRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        if (request.idCita() == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "ID de cita inválido."));
        }

        Cita cita = citaRepository
                .findByIdAndUsuarioCorreoIgnoreCase(request.idCita(), authentication.getName())
                .orElse(null);
        if (cita == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "Cita no encontrada."));
        }
        if (cita.isPagado()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "Esta cita ya fue pagada."));
        }

        Integer monto = extraerMontoServicio(cita.getServicio());
        if (monto == null) {
            logger.error("No se pudo determinar el monto del servicio para la cita {}", cita.getId());
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "No se pudo determinar el monto de esta cita."));
        }

        String buyOrder = "C" + Long.toString(cita.getId(), 36).toUpperCase()
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String sessionId = UUID.randomUUID().toString();

        try {
            var response = transbankTransaction.create(buyOrder, sessionId, monto, returnUrl);
            cita.setBuyOrder(buyOrder);
            citaRepository.save(cita);

            return ResponseEntity.ok(Map.of(
                    "url", response.getUrl(),
                    "token", response.getToken(),
                    "buyOrder", buyOrder
            ));
        } catch (IOException | TransactionCreateException error) {
            if (contieneErrorApiTransbank(error)) {
                logger.error("Transbank rechazó la configuración de integración al iniciar el pago", error);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("mensaje", "Transbank rechazó la solicitud de integración. Verifica la configuración."));
            }
            logger.error("No se pudo iniciar el pago Webpay para la cita {}", cita.getId(), error);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("mensaje", "No se pudo iniciar el pago con Transbank. Intenta nuevamente."));
        }
    }

    @PostMapping("/confirmar")
    @Operation(summary = "Confirmar pago", description = "Consulta y confirma con Transbank el token recibido al volver de Webpay. Marca la cita como pagada solo si estado y monto son válidos.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Pago autorizado y cita actualizada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ConfirmarPagoResponse.class),
                    examples = @ExampleObject(value = """
                            {"aprobado":true,"idCita":42,"authorizationCode":"123456","buyOrder":"C16-AB12CD34","monto":15000}
                            """)))
    @ApiResponse(responseCode = "400", description = "Token inválido, monto distinto o transacción no autorizada.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "401", description = "Falta un JWT válido para acceder.")
    @ApiResponse(responseCode = "404", description = "No se encontró una cita propia asociada a la transacción.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    @ApiResponse(responseCode = "502", description = "Transbank no pudo confirmar la transacción.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ApiErrorResponse.class)))
    public ResponseEntity<?> confirmarPago(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Token de transacción entregado por Webpay al retornar.",
                    content = @Content(examples = @ExampleObject(value = "{\"tokenWs\":\"abc123-token-webpay\"}"))
            ) @RequestBody ConfirmarPagoRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        if (request.tokenWs() == null || request.tokenWs().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Token de Transbank inválido."));
        }

        try {
            WebpayPlusTransactionStatusResponse status =
                    transbankTransaction.status(request.tokenWs());
            Cita cita = citaRepository
                    .findByBuyOrderAndUsuarioCorreoIgnoreCase(
                            status.getBuyOrder(),
                            authentication.getName()
                    )
                    .orElse(null);
            if (cita == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "No se encontró una cita asociada a esta transacción."));
            }

            Integer montoEsperado = extraerMontoServicio(cita.getServicio());
            if (montoEsperado == null || Math.round(status.getAmount()) != montoEsperado) {
                return ResponseEntity.badRequest()
                        .body(Map.of("mensaje", "El monto de la transacción no coincide con la cita."));
            }

            WebpayPlusTransactionStatusResponse transaccionConfirmada;
            if ("AUTHORIZED".equals(status.getStatus()) && status.getResponseCode() == 0) {
                transaccionConfirmada = status;
            } else if ("INITIALIZED".equals(status.getStatus())) {
                transaccionConfirmada = transbankTransaction.commit(request.tokenWs());
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("mensaje", "Transbank no autorizó el pago."));
            }

            if (!"AUTHORIZED".equals(transaccionConfirmada.getStatus())
                    || transaccionConfirmada.getResponseCode() != 0
                    || Math.round(transaccionConfirmada.getAmount()) != montoEsperado) {
                return ResponseEntity.badRequest()
                        .body(Map.of("mensaje", "Transbank no autorizó el pago."));
            }

            String codigoTransaccion = transaccionConfirmada.getAuthorizationCode();
            if (codigoTransaccion == null || codigoTransaccion.isBlank()) {
                codigoTransaccion = transaccionConfirmada.getBuyOrder();
            }

            cita.setPagado(true);
            cita.setEstado("Pagada");
            cita.setTransaccion(codigoTransaccion);
            citaRepository.save(cita);

            return ResponseEntity.ok(Map.of(
                    "aprobado", true,
                    "idCita", cita.getId(),
                    "authorizationCode", codigoTransaccion,
                    "buyOrder", cita.getBuyOrder(),
                    "monto", montoEsperado
            ));
        } catch (IOException | TransactionStatusException | TransactionCommitException error) {
            if (contieneErrorApiTransbank(error)) {
                logger.error("Transbank rechazó la solicitud de confirmación", error);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("mensaje", "Transbank rechazó la solicitud de confirmación."));
            }
            logger.error("No se pudo confirmar el pago Webpay", error);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("mensaje", "No se pudo confirmar el pago con Transbank."));
        }
    }

    private boolean contieneErrorApiTransbank(Throwable error) {
        for (Throwable causa = error; causa != null; causa = causa.getCause()) {
            if (causa instanceof TransbankHttpApiException) return true;
        }
        return false;
    }

    private Integer extraerMontoServicio(String servicio) {
        if (servicio == null) return null;

        Matcher matcher = MONTO_SERVICIO.matcher(servicio);
        if (!matcher.find()) return null;

        try {
            int monto = Integer.parseInt(matcher.group(1).replace(".", ""));
            return monto > 0 ? monto : null;
        } catch (NumberFormatException error) {
            return null;
        }
    }
}
