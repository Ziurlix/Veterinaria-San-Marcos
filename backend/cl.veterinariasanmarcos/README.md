# Configuración local

La aplicación obtiene las credenciales sensibles del entorno; no las guardes en `application.properties` ni en archivos versionados.

## Variables requeridas

Configura estas variables en el entorno desde el que ejecutas Spring Boot:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`: clave aleatoria de al menos 32 bytes. Al cambiarla, los tokens existentes dejarán de ser válidos.

En PowerShell, puedes definirlas para la sesión actual antes de iniciar la aplicación:

```powershell
$env:SPRING_DATASOURCE_URL = '<url de conexión JDBC>'
$env:SPRING_DATASOURCE_USERNAME = '<usuario de base de datos>'
$env:SPRING_DATASOURCE_PASSWORD = '<contraseña de base de datos>'
$env:JWT_SECRET = '<clave aleatoria de al menos 32 bytes>'
$env:TRANSBANK_ENVIRONMENT = 'integration'
$env:TRANSBANK_RETURN_URL = 'http://localhost:5173/pago-retorno'
.\mvnw.cmd spring-boot:run
```

La integración usa las credenciales de prueba oficiales del SDK y es el ambiente predeterminado. No se requieren variables de credenciales de Transbank para probarlo.

## Configuración futura de producción

La aplicación no inicia pagos de producción por defecto. Para habilitarlos deliberadamente se deben configurar **todas** estas variables con credenciales oficiales de producción:

- `TRANSBANK_ENVIRONMENT=production`
- `TRANSBANK_PRODUCTION_ENABLED=true`
- `TRANSBANK_COMMERCE_CODE`
- `TRANSBANK_API_KEY`
- `TRANSBANK_RETURN_URL` con una URL HTTPS pública

No uses credenciales de integración en producción. Mantén estas variables fuera del repositorio y no las compartas en logs ni conversaciones.
