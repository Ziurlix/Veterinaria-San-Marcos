# Puesta en marcha del backend

## Configuración

Antes de iniciar Spring Boot, definir estas variables de entorno:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`: clave aleatoria de al menos 32 bytes. Si se cambia, los tokens emitidos anteriormente dejarán de funcionar.

En PowerShell, los siguientes comandos configuran la sesión actual e inician la aplicación:

```powershell
$env:SPRING_DATASOURCE_URL = '<url de conexión JDBC>'
$env:SPRING_DATASOURCE_USERNAME = '<usuario de base de datos>'
$env:SPRING_DATASOURCE_PASSWORD = '<contraseña de base de datos>'
$env:JWT_SECRET = '<clave aleatoria de al menos 32 bytes>'
$env:TRANSBANK_ENVIRONMENT = 'integration'
$env:TRANSBANK_RETURN_URL = 'http://localhost:5173/pago-retorno'
.\mvnw.cmd spring-boot:run
```

Los pagos usan el ambiente de integración de Transbank de forma predeterminada. El SDK incluye credenciales de prueba, por lo que no se requiere una configuración adicional para este ambiente.

## Datos de prueba

### Tarjetas para pagos de prueba

En el ambiente de integración, estas tarjetas permiten comprobar tanto una aprobación como un rechazo:

| Resultado | Número de tarjeta | CVV | Fecha de expiración |
|---|---|---|---|
| Aprobación | `4051 8856 0044 6623` | `123` | Cualquier fecha futura |
| Rechazo | `5186 0595 5959 0568` | `123` | Cualquier fecha futura |

Son datos de prueba; no generan cobros reales y no funcionan fuera del ambiente de integración.

### Acceso de prueba

- **RUT:** `11.111.111-1`
- **Clave:** `123`

Estas credenciales están reservadas para el entorno de pruebas.

## Documentación de la API

Con el backend en ejecución, la API puede explorarse desde Swagger:

<http://localhost:8080/swagger-ui/index.html#/>

## Pagos en producción

Los pagos reales están desactivados de forma predeterminada. Su activación requiere **todas** las variables siguientes, junto con las credenciales oficiales de producción:

- `TRANSBANK_ENVIRONMENT=production`
- `TRANSBANK_PRODUCTION_ENABLED=true`
- `TRANSBANK_COMMERCE_CODE`
- `TRANSBANK_API_KEY`
- `TRANSBANK_RETURN_URL` con una URL HTTPS pública

Las credenciales de integración no sirven para procesar pagos reales. Las variables de producción deben guardarse fuera del repositorio y mantenerse fuera de los registros.



# Veterinaria San Marcos: frontend

Sitio web de la Clínica Veterinaria San Marcos. Permite crear una cuenta, iniciar sesión, solicitar y gestionar citas, y realizar pagos en línea.

## Tecnologías

- React
- Vite
- React Router
- Bootstrap
- Vitest y Testing Library
- Playwright

## Requisitos

- Node.js y npm
- Backend de Veterinaria San Marcos en ejecución para las funciones conectadas a la API

## Instalación

Desde el directorio `frontend/Veterinaria-San-Marcos-React`:

```bash
npm install
```

## Configuración de la API

`VITE_API_URL` indica la dirección base de la API. Si no se define, se utiliza:

```text
http://localhost:8080/api/v1
```

Para conectarse a otra instancia, crear un archivo `.env.local` en el directorio del frontend:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

La dirección debe incluir el prefijo `/api/v1`. Después de cambiarla, reiniciar Vite. Las variables `VITE_*` quedan visibles en el navegador; no deben contener contraseñas ni claves secretas.

Las instrucciones de configuración y ejecución del backend se encuentran en [`backend/cl.veterinariasanmarcos/README.md`](../../backend/cl.veterinariasanmarcos/README.md).

## Datos de prueba

Tarjetas de prueba para el ambiente de integración de Transbank:

| Resultado | Número de tarjeta | CVV | Expiración |
|---|---|---|---|
| Aprobación | `4051 8856 0044 6623` | `123` | Cualquier fecha futura |
| Rechazo | `5186 0595 5959 0568` | `123` | Cualquier fecha futura |

Credenciales de prueba:

- **RUT:** `11.111.111-1`
- **Clave:** `123`

Las tarjetas y credenciales son solo para pruebas y no deben utilizarse en producción.

## Swagger

La documentación interactiva de la API local está disponible en:

<http://localhost:8080/swagger-ui/index.html#/>

## Ejecución en desarrollo

```bash
npm run dev
```

La dirección local aparece en la terminal al iniciar Vite. Normalmente es `http://localhost:5173`.

## Validación

```bash
npm run lint
npm test
npm run test:coverage
npm run test:e2e
```

Las pruebas de extremo a extremo se ejecutan con Playwright. El servidor de desarrollo se inicia automáticamente en el puerto `4173`.

## Compilación

```bash
npm run build
npm run preview
```

Los archivos optimizados para producción se generan en `dist/`. El comando `npm run preview` permite revisarlos localmente.

## Estructura principal

```text
src/
├── components/   Navegación, ventanas y elementos compartidos
├── context/      Estado compartido entre las vistas
├── pages/        Páginas principales de la aplicación
└── service/      Conexión con la API
```

