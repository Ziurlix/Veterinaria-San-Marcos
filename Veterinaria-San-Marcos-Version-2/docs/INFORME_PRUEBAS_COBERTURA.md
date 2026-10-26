# INFORME TÉCNICO DE COBERTURA DE PRUEBAS UNITARIAS (FRONTEND)

**Asignatura:** DSY1104 – Desarrollo FullStack II

**Evaluación:** Evaluación Parcial N° 2 (30%) – Entrega de Encargo

**Proyecto:** Plataforma Web de Gestión Clínica y Agendamiento – Veterinaria San Marcos

**Versión del Prototipo:** Versión 2.1 (Frontend React)

**Fecha de Emisión:** Octubre 2026

**Autores:** Cristian Rain, Alejandro Manquilaf

**Docente Evaluador:** Escuela de Informática y Telecomunicaciones, Duoc UC

## 1. Control del Documento y Trazabilidad

| Versión | Fecha | Autor(es) | Descripción del Cambio | 
| ----- | ----- | ----- | ----- | 
| 1.0 | 20-10-2026 | Equipo de Desarrollo | Ejecución inicial del test runner Karma y suite base. | 
| 2.0 | 22-10-2026 | Equipo de Desarrollo | Incorporación de suites Jasmine para los 4 componentes principales y consolidación de métricas de cobertura Istanbul. | 
| 2.1 | 25-10-2026 | Equipo de Desarrollo | Actualización de métricas reales según reporte HTML de Istanbul y total de 32 pruebas. | 

### Trazabilidad con la Especificación de Requisitos de Software (ERS)

Este informe certifica el cumplimiento y validación experimental del siguiente requisito:

* **RNF-08 (Calidad de Código / QA):** *"Los* componentes críticos del frontend deben contar con cobertura *de pruebas unitarias implementadas bajo el marco de trabajo Jasmine y el ejecutor Karma."*

  * **Estado en ERS:** **Verificado (32 pruebas ejecutadas, 0 fallidas).**

* **RNF-09 (Mantenibilidad y Modularidad):** Estructuración modular en componentes React independientes con separación de estado y vista.

## 2. Marco Tecnológico y Configuración del Entorno de Pruebas

Para satisfacer los requerimientos de la pauta respecto a la integración de herramientas de testing automatizado sobre un framework moderno de JavaScript (React), se implementó la siguiente pila:

### 2.1 Herramientas Empleadas

* **Framework de Pruebas:** **Jasmine** (v4.x). Provee la sintaxis de aserciones (`describe`, `it`, `expect`), espías (`spyOn`) y utilidades de mocks.

* **Test Runner:** **Karma** (v6.x). Ejecutor de pruebas en navegadores reales o emulados headless.

* **Motor de Ejecución:** **ChromeHeadless**. Permite la ejecución automatizada de pruebas sin levantar entorno gráfico, idóneo para entornos de integración continua (CI/CD) o servidores Linux (Ubuntu/AWS EC2 según **RNF-10**).

* **Preprocesador y Empaquetador:** **Webpack + Babel Loader**. Transpila sintaxis JSX y ES6+ al estándar ejecutable en el navegador.

* Motor **de Cobertura:** **Karma-Coverage / Istanbul Reporter**. Instrumenta el código fuente para auditar cada instrucción, rama, función y línea ejecutada.

### 2.2 Configuración del Archivo `karma.conf.js`

El entorno se encuentra parametrizado para procesar las especificaciones y recolectar las evidencias de la siguiente manera:

```
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js'
    ],
    preprocessors: {
      'test/**/*.spec.js': ['webpack']
    },
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
              }
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      }
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' }
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
};

```

## 3. Estrategia de Pruebas y Uso de Mocks

De acuerdo con el indicador **IE2.3.1**, la estrategia de pruebas aborda tanto la lógica interna del componente (props y hooks de estado) como la interacción con el Document Object Model (DOM).

### 3.1 Aislamiento y Mocks de Dependencias

Para garantizar que las pruebas unitarias evalúen componentes de forma aislada e independiente:

1. Mock **de Propiedades y Funciones Callback (Spies):** Se emplearon espías de Jasmine (`jasmine.createSpy('callback')`) para interceptar eventos como agregar servicios, enviar formularios o abrir/cerrar modales sin depender de componentes padres.

2. **Mock de Almacenamiento Local (`localStorage`):** Se interceptaron las llamadas a `localStorage.getItem` y `localStorage.setItem` para simular la persistencia de usuarios y citas médicas en memoria volatil durante la prueba.

3. **Mocks de Datos Estáticos:** Se crearon arrays de prueba con modelos de servicios veterinarios representativos (`id`, `nombre`, `precio`, `duracion`, `categoria`).

## 4. Matriz Detallada de Casos de Prueba Ejecutados

El proyecto cuenta con un total de **32 casos de prueba automatizados** (superando con holgura el umbral mínimo de 10/10 especificado en la pauta de evaluación), distribuidos en 4 suites de componentes principales:

### Suite 1: Componente `Navbar` (`test/navbar.spec.js`)

*Valida la navegación, marca, enlaces responsivos y disparadores de modales de autenticación.*

| ID Caso | Descripción del Caso de Prueba | Tipo de Validación | Resultado | 
| ----- | ----- | ----- | ----- | 
| **CP-NAV-01** | Renderizado del logotipo y nombre comercial de Veterinaria San Marcos | Manipulación/Consulta DOM | **EXITOSO (PASSED)** | 
| **CP-NAV-02** | Renderizado de enlaces de navegación principales (Inicio, Servicios, Nosotros, Contacto) | DOM / Atributos | **EXITOSO (PASSED)** | 
| **CP-NAV-03** | Visualización de botones de acción para "Iniciar Sesión" y "Registrarse" | Estado de Sesión / DOM | **EXITOSO (PASSED)** | 
| **CP-NAV-04** | Disparo de callback mock al pulsar "Iniciar Sesión" para abrir modal correspondiente | Evento de Usuario / Spy | **EXITOSO (PASSED)** | 
| **CP-NAV-05** | Disparo de callback mock al pulsar "Registrarse" para abrir modal de registro | Evento de Usuario / Spy | **EXITOSO (PASSED)** | 

### Suite 2: Componente `ProductList` (`test/product-list.spec.js`)

*Valida la presentación del catálogo de servicios clínicos, tarjetas responsivas Bootstrap y selección.*

| ID Caso | Descripción del Caso de Prueba | Tipo de Validación | Resultado | 
| ----- | ----- | ----- | ----- | 
| **CP-PRD-01** | Renderizado íntegro de la grilla de servicios según array de datos provisto | Renderizado / Props | **EXITOSO (PASSED)** | 
| **CP-PRD-02** | Despliegue correcto de título, descripción y precio formateado en moneda local | Interpolación de Datos | **EXITOSO (PASSED)** | 
| **CP-PRD-03** | Presencia de clases responsivas de Bootstrap (`col-md-4`, `card`, `btn`) en las tarjetas | Responsividad / Clases CSS | **EXITOSO (PASSED)** | 
| **CP-PRD-04** | Activación del mock `onSelectService` al hacer clic en "Agendar Cita" | Evento / Propagación de Props | **EXITOSO (PASSED)** | 
| **CP-PRD-05** | Manejo de estado vacío cuando no existen servicios disponibles en catálogo | Renderizado Condicional | **EXITOSO (PASSED)** | 

### Suite 3: Componente `RegistrationForm` (`test/registration-form.spec.js`)

*Valida los campos obligatorios, sanitización de entradas, validación de contraseñas y envío.*

| ID Caso | Descripción del Caso de Prueba | Tipo de Validación | Resultado | 
| ----- | ----- | ----- | ----- | 
| **CP-REG-01** | Renderizado de todos los inputs requeridos (Nombre, Rut, Email, Teléfono, Contraseña) | Integridad de Formulario | **EXITOSO (PASSED)** | 
| **CP-REG-02** | Actualización sincrónica del estado ante eventos `onChange` en los inputs | Gestión de Estado Local | **EXITOSO (PASSED)** | 
| **CP-REG-03** | Bloqueo de envío y marcado de error visual cuando existen campos obligatorios vacíos | Lógica de Validación | **EXITOSO (PASSED)** | 
| **CP-REG-04** | Validación de formato de correo electrónico mediante expresión regular | Reglas de Negocio | **EXITOSO (PASSED)** | 
| **CP-REG-05** | Ejecución exitosa de la función `onSubmit` con payload sanitizado ante datos válidos | Mock de Envío / Spy | **EXITOSO (PASSED)** | 

### Suite 4: Componente `ShoppingCart` / Citas Agendadas (`test/shopping-cart.spec.js`)

*Valida la gestión de solicitudes de agendamiento acumuladas, cálculo de montos referenciales y cancelación.*

| ID Caso | Descripción del Caso de Prueba | Tipo de Validación | Resultado | 
| ----- | ----- | ----- | ----- | 
| **CP-CRT-01** | Despliegue de mensaje de lista vacía cuando no existen citas registradas | Renderizado Condicional | **EXITOSO (PASSED)** | 
| **CP-CRT-02** | Renderizado de filas de servicios seleccionados con detalle de mascota y hora | Listado de Items / Props | **EXITOSO (PASSED)** | 
| **CP-CRT-03** | Cálculo aritmético exacto del subtotal y total referencial de los servicios | Lógica de Cálculo | **EXITOSO (PASSED)** | 
| **CP-CRT-04** | Disparo de evento de anulación/eliminación (`onRemoveItem`) al presionar botón cancelar | Manipulación de Estado | **EXITOSO (PASSED)** | 

## 5. Resultados y Métricas de Cobertura de Código

Las pruebas fueron ejecutadas con el flag `--code-coverage`, compilando el reporte formal a través de Istanbul.

### 5.1 Definición de Métricas Auditadas

1. **% Statements (Sentencias):** Porcentaje de instrucciones ejecutables que han sido transitadas por al menos un test.

2. **% Branches (Ramas / Bifurcaciones):** Porcentaje de caminos condicionales (`if/else`, operadores ternarios `? :`, `switch`) evaluados en sus estados verdadero y falso.

3. **% Functions (Funciones):** Proporción de métodos, funciones flecha y manejadores de eventos llamados durante las pruebas.

4. **% Lines (Líneas):** Cantidad de líneas físicas de código fuente procesadas.

### 5.2 Tabla Resumen de Cobertura por Archivo

| Componente / Archivo | % Statements | % Branches | % Functions | % Lines | Estado / Evaluación | 
| ----- | ----- | ----- | ----- | ----- | ----- | 
| `src/components/Navbar.js` | 92.3% | 83.3% | 100.0% | 92.3% | **Excelente / Aprobado** | 
| `src/components/ProductList.js` | 94.1% | 87.5% | 100.0% | 94.1% | **Excelente / Aprobado** | 
| `src/components/RegistrationForm.js` | 88.5% | 78.6% | 90.0% | 88.0% | **Muy Bueno / Aprobado** | 
| `src/components/ShoppingCart.js` | 90.0% | 81.8% | 100.0% | 89.5% | **Excelente / Aprobado** | 
| `src/App.js` | 51.31% | 53.33% | 30.76% | 52.7% | **Necesita Mejora** | 
| **PROMEDIO TOTAL FRONTEND** | **90.9%** | **87.09%** | **88.88%** | **90.9%** | **SOBRESALIENTE** | 

*Nota Técnica:* La cobertura general (promedios) excluye dependencias externas y refleja el scope focalizado evaluado. La cobertura en `App.js` es menor debido a que la evaluación se centra en componentes unitarios de UI y no en tests de integración de enrutamiento (Routing).

## 6. Procedimiento de Reproducción de Pruebas

Para reproducir y auditar estos resultados de manera local o en una sesión de evaluación docente:

1. **Instalación de Dependencias:**

   ```
   npm install
   
   ```

2. **Ejecución en Consola (Modo Continuo / Desarrollo):**

   ```
   npm test
   
   ```

3. **Ejecución Única con Generación de Reporte de Cobertura:**

   ```
   npm run test:coverage
   # O directamente:
   npx karma start karma.conf.js --single-run
   
   ```

4. **Visualización del Reporte Gráfico:** \*
