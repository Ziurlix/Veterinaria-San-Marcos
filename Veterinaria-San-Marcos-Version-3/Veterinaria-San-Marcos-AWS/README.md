Veterinaria San Marcos 🐾

Sobre el proyecto

Este proyecto consiste en una página web para la Veterinaria San Marcos, cuyo objetivo es facilitar la información y algunos de los servicios que ofrece la veterinaria.

La idea es que los usuarios puedan conocer los servicios disponibles, registrarse, iniciar sesión y solicitar citas para sus mascotas de una manera sencilla.

¿Qué se puede hacer en la página?

Conocer los servicios veterinarios.

Crear una cuenta e iniciar sesión.

Solicitar citas para las mascotas.

Revisar las citas registradas.

Solicitar la cancelación de una cita.

Consultar la información de contacto y ubicación de la veterinaria.

Pruebas unitarias

Se realizaron 18 pruebas unitarias para comprobar que las principales funciones de la página trabajen correctamente.

Para realizar estas pruebas se utilizaron las siguientes herramientas:

Karma: para ejecutar las pruebas unitarias.

Jasmine: para crear y comprobar cada una de las pruebas.

Google Chrome Headless: para ejecutar las pruebas automáticamente sin necesidad de abrir el navegador.

Detalle de las 18 pruebas

1. Menú de navegación (3 pruebas)

Comprobar que se muestre el nombre de Veterinaria San Marcos.

Comprobar que aparezcan los cinco enlaces principales: Inicio, Nosotros, Servicios, Ubicación y Contacto.

Comprobar que se ejecute la acción de iniciar sesión cuando no hay un usuario conectado.

2. Servicios veterinarios (3 pruebas)

Comprobar que se muestre el título de la sección de servicios.

Comprobar que aparezcan los cinco servicios veterinarios.

Comprobar que se muestre la duración y el precio referencial de los servicios.

3. Registro de usuarios (4 pruebas)

Comprobar que se rechace el registro cuando los campos están vacíos.

Comprobar que se valide el formato del correo electrónico y del teléfono.

Comprobar que se rechacen las contraseñas cuando no coinciden.

Comprobar que se envíen los datos cuando el formulario es válido.

4. Solicitud y administración de citas (8 pruebas)

Comprobar que aparezcan los campos necesarios para solicitar una cita.

Comprobar que se seleccione automáticamente el primer procedimiento de la categoría elegida.

Comprobar que no se permita seleccionar una fecha anterior al día actual.

Comprobar que se envíen correctamente los datos cuando la solicitud de cita es válida.

Comprobar que se muestre un mensaje cuando no existen citas registradas.

Comprobar que se muestren los datos principales de una cita.

Comprobar que se pueda solicitar la cancelación de una cita.

Comprobar que se pueda cerrar la ventana de consulta de citas.

Resultado de las pruebas

Las 18 pruebas se ejecutaron correctamente en AWS, sin resultados fallidos.

Resultado: 18 pruebas exitosas y 0 fallidas.

También se obtuvo el siguiente resultado de cobertura:

Indicador

Resultado

Sentencias

89,28 %

Ramas

81,33 %

Funciones

89,74 %

Líneas

92,47 %

¿Cómo ejecutar el proyecto?

Primero, instalar las dependencias:

npm install

Para iniciar la página:

npm start

Para ejecutar las pruebas unitarias:

npm test

Para generar la versión de producción:

npm run build

Comentario final

Este proyecto fue desarrollado con el propósito de ofrecer una alternativa más sencilla y ordenada para mostrar los servicios de Veterinaria San Marcos y facilitar la interacción de sus usuarios con la página.

Durante el desarrollo se realizaron pruebas para comprobar que las principales funciones respondan correctamente. Finalmente, se logró ejecutar las 18 pruebas unitarias con Karma y Jasmine en Google Chrome Headless, además de compilar el proyecto exitosamente en AWS.
