# Pruebas unitarias — Veterinaria San Marcos

La suite está implementada con Karma, Jasmine y React Testing Library. Se definieron 18 casos:

| N.º | Componente | Verificación |
|---:|---|---|
| 01 | Navbar | Muestra el nombre del sitio. |
| 02 | Navbar | Muestra los cinco enlaces principales. |
| 03 | Navbar | Abre el inicio de sesión cuando no hay usuario conectado. |
| 04 | ProductList | Muestra el título de servicios. |
| 05 | ProductList | Muestra las cinco categorías. |
| 06 | ProductList | Muestra duración y precio referencial. |
| 07 | RegistrationForm | Rechaza campos vacíos. |
| 08 | RegistrationForm | Valida formato de correo y teléfono. |
| 09 | RegistrationForm | Rechaza contraseñas diferentes. |
| 10 | RegistrationForm | Envía los datos cuando el registro es válido. |
| 11 | AppointmentForm | Muestra los campos de solicitud de cita. |
| 12 | AppointmentForm | Preselecciona un procedimiento de la categoría elegida. |
| 13 | AppointmentForm | Rechaza fechas anteriores al día actual. |
| 14 | AppointmentForm | Envía una cita válida. |
| 15 | ShoppingCart | Muestra el estado sin citas. |
| 16 | ShoppingCart | Muestra los datos principales de una cita. |
| 17 | ShoppingCart | Solicita cancelar la cita seleccionada. |
| 18 | ShoppingCart | Ejecuta el cierre de la ventana de citas. |

Ejecutar desde la raíz del proyecto:

```bash
npm test
```

El número de pruebas definidas es 18. Los resultados de aprobación y los porcentajes de cobertura deben tomarse de una ejecución real del comando sobre la versión que se entrega; no se deben copiar porcentajes de ejecuciones anteriores.
