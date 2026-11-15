// =========================================
// VETERINARIA SAN MARCOS
// JAVASCRIPT PRINCIPAL
// =========================================


// =========================================
// ESTADO DE SESIÓN
// =========================================

let usuarioLogueado =
    sessionStorage.getItem("usuarioLogueado") === "true";

let servicioPendiente = null;

let citaEnEdicionId = null;


// =========================================
// ELEMENTOS DEL LOGIN
// =========================================

const btnLogin =
    document.getElementById("btnLogin");

const formLogin =
    document.getElementById("formLogin");

const correoLogin =
    document.getElementById("correoLogin");

const passwordLogin =
    document.getElementById("passwordLogin");


// =========================================
// ELEMENTOS DE CITA
// =========================================

const formCita =
    document.getElementById("formCita");

const nombreMascota =
    document.getElementById("nombreMascota");

const tipoMascota =
    document.getElementById("tipoMascota");

const servicioCita =
    document.getElementById("servicioCita");

const fechaCita =
    document.getElementById("fechaCita");

const horaCita =
    document.getElementById("horaCita");

const motivoCita =
    document.getElementById("motivoCita");

const categoriaCita = 
    document.getElementById("categoriaCita");

// =========================================
// DATOS DE SERVICIOS PARA EL SELECTOR DINÁMICO
// =========================================
const serviciosPorCategoria = {
    "Consulta General": [
        { valor: "Consulta General de Rutina", texto: "Consulta General de Rutina" },
        { valor: "Urgencia / No sé qué le pasa", texto: "Urgencia / No sé qué le pasa" }
    ],
    "Vacunación": [
        { valor: "Vacuna antirrábica ($12.000)", texto: "Vacuna antirrábica - $12.000" },
        { valor: "Vacuna séxtuple canina ($18.000)", texto: "Vacuna séxtuple canina - $18.000" },
        { valor: "Vacuna bivalente felina ($15.000)", texto: "Vacuna bivalente felina - $15.000" },
        { valor: "Vacuna triple felina ($17.000)", texto: "Vacuna triple felina - $17.000" },
        { valor: "Vacuna Bordetella ($14.000)", texto: "Vacuna Bordetella - $14.000" }
    ],
    "Cirugía": [
        { valor: "Esterilización canina (Desde $60.000)", texto: "Esterilización canina - Desde $60.000" },
        { valor: "Esterilización felina (Desde $50.000)", texto: "Esterilización felina - Desde $50.000" },
        { valor: "Extirpación tumor ($120.000)", texto: "Extirpación tumor - $120.000" },
        { valor: "Cesárea de urgencia ($180.000)", texto: "Cesárea de urgencia - $180.000" }
    ],
    "Desparasitación": [
        { valor: "Desparasitación interna (Desde $8.000)", texto: "Desparasitación interna - Desde $8.000" },
        { valor: "Antiparasitario externo pipeta ($7.500)", texto: "Antiparasitario externo (pipeta) - $7.500" }
    ],
    "Exámenes clínicos": [
        { valor: "Hemograma completo ($22.000)", texto: "Hemograma completo - $22.000" },
        { valor: "Perfil bioquímico ($35.000)", texto: "Perfil bioquímico - $35.000" },
        { valor: "Radiografía ($28.000)", texto: "Radiografía - $28.000" },
        { valor: "Ecografía abdominal ($45.000)", texto: "Ecografía abdominal - $45.000" },
        { valor: "Test de leishmaniasis ($18.000)", texto: "Test de leishmaniasis - $18.000" }
    ],
    "Procedimientos y Cuidados": [
        { valor: "Corte de uñas ($5.000)", texto: "Corte de uñas - $5.000" },
        { valor: "Limpieza dental ($55.000)", texto: "Limpieza dental - $55.000" },
        { valor: "Microchip de identificación ($15.000)", texto: "Microchip de identificación - $15.000" },
        { valor: "Hospitalización por día ($30.000)", texto: "Hospitalización (día) - $30.000" }
    ]
};

function actualizarSelectorServicios(categoriaSeleccionada, servicioPreseleccionado = "") {
    if (!servicioCita) return;
    
    servicioCita.innerHTML = '<option value="">Selecciona un servicio específico</option>';
    
    if (categoriaSeleccionada && serviciosPorCategoria[categoriaSeleccionada]) {
        servicioCita.disabled = false; // Habilitamos el segundo selector
        serviciosPorCategoria[categoriaSeleccionada].forEach(srv => {
            const option = document.createElement("option");
            option.value = srv.valor;
            option.textContent = srv.texto;
            if (srv.valor === servicioPreseleccionado) option.selected = true;
            servicioCita.appendChild(option);
        });
    } else {
        servicioCita.disabled = true; // Lo volveamos a bloquear si no hay categoría
        servicioCita.innerHTML = '<option value="">Primero selecciona una categoría</option>';
    }
}

// Escuchar cambios en el primer selector
if (categoriaCita) {
    categoriaCita.addEventListener("change", function() {
        actualizarSelectorServicios(this.value);
    });
}


// =========================================
// ELEMENTOS MI CUENTA
// =========================================

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const btnMisCitas =
    document.getElementById("btnMisCitas");

const modalCuenta =
    document.getElementById("modalCuenta");

const modalMisCitas =
    document.getElementById("modalMisCitas");

const listaCitas =
    document.getElementById("listaCitas");
    


// =========================================
// ACTUALIZAR ESTADO DEL BOTÓN
// =========================================

function actualizarEstadoSesion() {

    if (!btnLogin) {
        return;
    }

    if (usuarioLogueado) {

        btnLogin.textContent =
            "👤 Mi cuenta";

        btnLogin.classList.remove(
            "btn-light"
        );

        btnLogin.classList.add(
            "btn-warning"
        );

    } else {

        btnLogin.textContent =
            "Iniciar sesión";

        btnLogin.classList.remove(
            "btn-warning"
        );

        btnLogin.classList.add(
            "btn-light"
        );

    }
}

actualizarEstadoSesion();


// =========================================
// OBTENER USUARIO ACTUAL O BUSCAR UNO
// =========================================
function obtenerUsuariosGuardados() {
    return JSON.parse(localStorage.getItem("usuariosVeterinaria")) || [];
}

function obtenerUsuarioActual() {
    const correoActual = sessionStorage.getItem("correoUsuarioActual");
    const usuarios = obtenerUsuariosGuardados();
    return usuarios.find(u => u.correo.toLowerCase() === (correoActual || "").toLowerCase());
}


// =========================================
// OBTENER CITAS
// =========================================

function obtenerCitas() {

    return JSON.parse(
        localStorage.getItem(
            "citasVeterinaria"
        )
    ) || [];

}


// =========================================
// GUARDAR CITAS
// =========================================

function guardarCitas(citas) {
    localStorage.setItem(
        "citasVeterinaria",
        JSON.stringify(citas)
    );
}

// =========================================
// OBTENER USUARIO ACTUAL O BUSCAR UNO
// =========================================
function obtenerUsuariosGuardados() {
    return JSON.parse(localStorage.getItem("usuariosVeterinaria")) || [];
}

function obtenerUsuarioActual() {
    const correoActual = sessionStorage.getItem("correoUsuarioActual");
    const usuarios = obtenerUsuariosGuardados();
    return usuarios.find(u => u.correo.toLowerCase() === (correoActual || "").toLowerCase());
}


// =========================================
// ABRIR LOGIN
// =========================================

function abrirLogin() {

    const modalElemento =
        document.getElementById("modalLogin");

    if (!modalElemento) {
        return;
    }

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElemento
        );

    modal.show();
}


// =========================================
// ABRIR FORMULARIO DE CITA
// =========================================

function abrirFormularioCita(categoria = "") {
    const modalElemento = document.getElementById("modalCita");
    if (!modalElemento) return;

    if (categoriaCita) {
        categoriaCita.value = categoria;
        actualizarSelectorServicios(categoria);
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
    modal.show();
}


// =========================================
// BOTÓN LOGIN / MI CUENTA
// =========================================

if (btnLogin) {

    btnLogin.addEventListener(
        "click",
        function () {

            // Si está logueado
            if (usuarioLogueado) {

                const usuario =
                    obtenerUsuarioActual();

                if (usuario) {

                    document.getElementById(
                        "cuentaNombre"
                    ).textContent =
                        usuario.nombre;

                    document.getElementById(
                        "cuentaCorreo"
                    ).textContent =
                        usuario.correo;

                    document.getElementById(
                        "cuentaTelefono"
                    ).textContent =
                        usuario.telefono;

                }


                const modal =
                    bootstrap.Modal.getOrCreateInstance(
                        modalCuenta
                    );

                modal.show();

                return;
            }


            // Si no está logueado
            abrirLogin();

        }
    );

}


// =========================================
// CERRAR SESIÓN
// =========================================

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
        "click",
        function () {

usuarioLogueado = false;
            sessionStorage.removeItem("usuarioLogueado");
            sessionStorage.removeItem("correoUsuarioActual"); // <-- Línea agregada
            servicioPendiente = null;
            actualizarEstadoSesion();


            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalCuenta
                );

            modal.hide();

        }
    );

}


// =========================================
// LOGIN
// =========================================

if (formLogin) {

    formLogin.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            correoLogin.classList.remove(
                "is-invalid"
            );

            passwordLogin.classList.remove(
                "is-invalid"
            );


            let hayErrores = false;


            // Validar correo
            if (
                correoLogin.value.trim() === ""
            ) {

                correoLogin.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorCorreo"
                ).textContent =
                    "Ingresa tu correo electrónico.";

                hayErrores = true;

            } else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
                        correoLogin.value.trim()
                    )
            ) {

                correoLogin.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorCorreo"
                ).textContent =
                    "Ingresa un correo electrónico válido.";

                hayErrores = true;

            }


            // Validar contraseña
            if (
                passwordLogin.value.trim() === ""
            ) {

                passwordLogin.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorPassword"
                ).textContent =
                    "La contraseña es obligatoria.";

                hayErrores = true;

            }


            // Comprobar usuario
if (!hayErrores) {
                const usuarios = obtenerUsuariosGuardados();
                const correoIngresado = correoLogin.value.trim().toLowerCase();
                const usuario = usuarios.find(u => u.correo.toLowerCase() === correoIngresado);

                if (!usuario) {
                    correoLogin.classList.add("is-invalid");
                    document.getElementById("errorCorreo").textContent = "No existe una cuenta registrada con este correo.";
                    hayErrores = true;
                } else {
                    // Contraseña incorrecta
                    if (passwordLogin.value !== usuario.password) {
                        passwordLogin.classList.add("is-invalid");
                        document.getElementById("errorPassword").textContent = "La contraseña es incorrecta.";
                        hayErrores = true;
                    }
                }
            }

            // Login correcto
            if (!hayErrores) {
                usuarioLogueado = true;
                sessionStorage.setItem("usuarioLogueado", "true");
                sessionStorage.setItem("correoUsuarioActual", correoLogin.value.trim()); // Guardamos quién se logueó
                
                actualizarEstadoSesion();


                const modalElemento =
                    document.getElementById(
                        "modalLogin"
                    );

                const modal =
                    bootstrap.Modal.getOrCreateInstance(
                        modalElemento
                    );

                modal.hide();


                formLogin.reset();


                // Si venía desde un servicio
                if (servicioPendiente) {

                    const servicio =
                        servicioPendiente;

                    servicioPendiente = null;


                    setTimeout(
                        function () {

                            abrirFormularioCita(
                                servicio
                            );

                        },
                        300
                    );

                }

            }

        }
    );

}


// =========================================
// BOTONES DE SERVICIOS
// =========================================

const botonesServicio =
    document.querySelectorAll(
        ".btnServicio"
    );


botonesServicio.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const servicioSeleccionado =
                    boton.dataset.servicio;


                if (!usuarioLogueado) {

                    servicioPendiente =
                        servicioSeleccionado;

                    abrirLogin();

                    return;

                }


                abrirFormularioCita(
                    servicioSeleccionado
                );

            }
        );

    }
);


// =========================================
// BOTÓN PRINCIPAL SOLICITAR CITA
// =========================================

const botonesSolicitarCita =
    document.querySelectorAll(
        "#btnSolicitarCita, #btnAgendarVisita"
    );


if (botonesSolicitarCita.length > 0) {

    botonesSolicitarCita.forEach(function (boton) {

        boton.addEventListener(
            "click",
            function () {

            if (!usuarioLogueado) {

                servicioPendiente = null;

                abrirLogin();

                return;

            }


            if (servicioCita) {

                servicioCita.value = "";

            }

            if (formCita) formCita.reset();
            citaEnEdicionId = null; 
            abrirFormularioCita();

            }
        );

    });

}


// =========================================
// FORMULARIO DE CITA
// =========================================

if (formCita) {

    formCita.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Limpiar errores            
            categoriaCita.classList.remove("is-invalid");
            
            nombreMascota.classList.remove("is-invalid");

            tipoMascota.classList.remove("is-invalid");

            servicioCita.classList.remove("is-invalid");

            fechaCita.classList.remove("is-invalid");

            horaCita.classList.remove("is-invalid");

            motivoCita.classList.remove("is-invalid");

            let hayErrores = false;


            // Nombre mascota
            if (
                nombreMascota.value.trim() === ""
            ) {

                nombreMascota.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Tipo mascota
            if (
                tipoMascota.value === ""
            ) {

                tipoMascota.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }

            // Categoría
            if (categoriaCita.value === "") {
                categoriaCita.classList.add("is-invalid");
                hayErrores = true;
            }

            // Servicio
            if (servicioCita.value === "") {


                servicioCita.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Fecha
            if (
                fechaCita.value === ""
            ) {

                fechaCita.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Hora
            if (
                horaCita.value === ""
            ) {

                horaCita.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Motivo
            if (
                motivoCita.value.trim() === ""
            ) {

                motivoCita.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }

            // Verificar si hay choques de horario antes de guardar
            if (!hayErrores) {
                const citasExistentes = obtenerCitas();
                const choque = citasExistentes.some(c => 
                    c.fecha === fechaCita.value && 
                    c.hora === horaCita.value && 
                    c.id !== citaEnEdicionId // Ignoramos la cita actual si estamos en modo edición
                );

                if (choque) {
                    horaCita.classList.add("is-invalid");
                    mostrarNotificacion("Ese horario ya se encuentra reservado. Elige otro.", "danger");
                    hayErrores = true;
                }
            }


            // =====================================
            // GUARDAR CITA
            // =====================================
            if (!hayErrores) {
                const usuario = obtenerUsuarioActual();
                let citas = obtenerCitas();

                if (citaEnEdicionId !== null) {
                    // MODO EDICIÓN: Actualiza la cita existente
                    const index = citas.findIndex(c => c.id === citaEnEdicionId);
                    if (index !== -1) {
                        citas[index].mascota = nombreMascota.value.trim();
                        citas[index].tipoMascota = tipoMascota.value;
                        citas[index].categoria = categoriaCita.value; // <-- GUARDAMOS CATEGORIA
                        citas[index].servicio = servicioCita.value;
                        citas[index].fecha = fechaCita.value;
                        citas[index].hora = horaCita.value;
                        citas[index].motivo = motivoCita.value.trim();
                    }
                    mostrarNotificacion("Cita actualizada correctamente.", "success");
                    citaEnEdicionId = null; // Reseteamos el ID
                } else {
                    // MODO CREACIÓN: Crea una cita nueva
                    const nuevaCita = {
                        id: Date.now(),
                        usuario: usuario.correo,
                        mascota: nombreMascota.value.trim(),
                        tipoMascota: tipoMascota.value,
                        categoria: categoriaCita.value, // <-- GUARDAMOS CATEGORIA
                        servicio: servicioCita.value,
                        fecha: fechaCita.value,
                        hora: horaCita.value,
                        motivo: motivoCita.value.trim(),
                        estado: "Pendiente",
                        pagado: false,        // <-- NUEVO
                        transaccion: null     // <-- NUEVO
                    };
                    citas.push(nuevaCita);
                    mostrarNotificacion("Solicitud de cita enviada correctamente.", "success");
                }

                guardarCitas(citas);
                formCita.reset();
                bootstrap.Modal.getOrCreateInstance(document.getElementById("modalCita")).hide();
                
                // Si el modal de "Mis citas" estaba abierto por detrás, lo actualizamos
                if (listaCitas) mostrarMisCitas();
            }
        }
    );

}


// =========================================
// SANITIZAR TEXTO (Evitar XSS)
// =========================================
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// =========================================
// MOSTRAR MIS CITAS
// =========================================

function cancelarCita(idCita) {
    let citas = obtenerCitas();
    citas = citas.filter(cita => cita.id !== idCita);
    guardarCitas(citas);
    mostrarMisCitas();
}

function editarCita(idCita) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === idCita);
    
    if(cita) {
        nombreMascota.value = cita.mascota;
        tipoMascota.value = cita.tipoMascota;
        
        // Restaurar categoría y repoblar el servicio preseleccionándolo
        categoriaCita.value = cita.categoria;
        actualizarSelectorServicios(cita.categoria, cita.servicio);
        
        // Actualizar la fecha en la instancia de Flatpickr para que se refleje visualmente
        const fp = document.getElementById("fechaCita")._flatpickr;
        if (fp) {
            fp.setDate(cita.fecha, true, "d/m/Y");
        } else {
            fechaCita.value = cita.fecha;
        }
        
        horaCita.value = cita.hora;
        motivoCita.value = cita.motivo;
        
        citaEnEdicionId = idCita;
        
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalMisCitas")).hide();
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalCita")).show();
    }
}

// =========================================
// MOSTRAR MIS CITAS (CON PESTAÑAS)
// =========================================
function mostrarMisCitas() {
    const contenedorPendientes = document.getElementById("listaCitasPendientes");
    const contenedorPagadas = document.getElementById("listaCitasPagadas");

    if (!contenedorPendientes || !contenedorPagadas) return;

    const usuario = obtenerUsuarioActual();
    const citas = obtenerCitas();

    // Filtrar citas solo del usuario actual
    const misCitas = citas.filter(cita => usuario && cita.usuario === usuario.correo);

    // Separar citas en pendientes y pagadas
    const citasPendientes = misCitas.filter(cita => !cita.pagado);
    const citasPagadas = misCitas.filter(cita => cita.pagado);

    // Función interna para generar el HTML de las tarjetas
    function generarHTMLCitas(lista) {
        if (lista.length === 0) {
            return `<p class="text-center text-muted mt-4">No tienes citas en esta sección.</p>`;
        }

        return lista.map(cita => {
            let botonesAccion = "";
            if (cita.pagado) {
                botonesAccion = `
                    <div class="mt-3 p-3 bg-light rounded text-center border">
                        <span class="badge bg-success mb-2 fs-6">✅ Pago Confirmado</span><br>
                        <small class="text-muted d-block mb-2">Código Tx: ${escaparHTML(cita.transaccion)}</small>
                        <button type="button" class="btn btn-sm btn-info text-white fw-bold w-100" onclick="verComprobante(${cita.id})">🧾 Ver Comprobante</button>
                    </div>
                `;
            } else {
                botonesAccion = `
                    <div class="mt-3">
                        <button type="button" class="btn btn-sm btn-success me-1 mb-1" onclick="irAPagar(${cita.id})">💳 Pagar anticipado</button>
                        <button type="button" class="btn btn-sm btn-outline-primary me-1 mb-1" onclick="editarCita(${cita.id})">Editar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger mb-1" onclick="cancelarCita(${cita.id})">Cancelar</button>
                    </div>
                `;
            }

            return `
                <div class="cita-card">
                    <h3>📅 ${escaparHTML(cita.servicio)}</h3>
                    <p><strong>Mascota:</strong> ${escaparHTML(cita.mascota)}</p>
                    <p><strong>Tipo:</strong> ${escaparHTML(cita.tipoMascota)}</p>
                    <p><strong>Fecha:</strong> ${escaparHTML(cita.fecha)}</p>
                    <p><strong>Hora:</strong> ${escaparHTML(cita.hora)}</p>
                    <p><strong>Motivo:</strong> ${escaparHTML(cita.motivo)}</p>
                    <span class="estado-pendiente">${escaparHTML(cita.estado)}</span>
                    ${botonesAccion}
                </div>
            `;
        }).join("");
    }

    // Inyectar el HTML generado en sus respectivas pestañas
    contenedorPendientes.innerHTML = generarHTMLCitas(citasPendientes);
    contenedorPagadas.innerHTML = generarHTMLCitas(citasPagadas);
}

    // =========================================
// IR A PASARELA DE PAGO
// =========================================
function irAPagar(idCita) {
    // Redirigimos a la página de pago pasando el ID por la URL
    window.location.href = `pago.html?id=${idCita}`;
}

// =========================================
// VER COMPROBANTE DE PAGO (PDF)
// =========================================
function verComprobante(idCita) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === idCita);
    
    if(cita) {
        // Verificar si la librería jsPDF cargó correctamente
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            mostrarNotificacion("Error al generar el PDF. Verifica tu conexión.", "danger");
            return;
        }

        // Crear documento PDF
        const doc = new jsPDF();
        
        // --- DISEÑO DEL COMPROBANTE ---
        // Título de la Clínica (Centrado)
        doc.setFontSize(22);
        doc.setTextColor(18, 62, 50); // Color verde oscuro (#123e32)
        doc.text("Veterinaria San Marcos", 105, 20, null, null, "center");
        
        // Subtítulo
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("Comprobante de Pago Anticipado", 105, 30, null, null, "center");
        
        // Línea separadora
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 40, 190, 40);
        
        // Datos de la transacción
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Código de Transacción:`, 20, 55);
        doc.setFont(undefined, 'bold');
        doc.text(cita.transaccion, 75, 55);
        
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha de Emisión:`, 20, 65);
        doc.text(new Date().toLocaleDateString('es-CL'), 75, 65);
        
        doc.text(`Paciente (Mascota):`, 20, 75);
        doc.text(cita.mascota, 75, 75);
        
        doc.text(`Fecha de la Cita:`, 20, 85);
        doc.text(`${cita.fecha} a las ${cita.hora}`, 75, 85);
        
        doc.text(`Servicio Pagado:`, 20, 95);
        // Dividir texto largo del servicio para que no se salga de la hoja
        const servicioSplit = doc.splitTextToSize(cita.servicio, 110);
        doc.text(servicioSplit, 75, 95);
        
        // Línea final
        doc.setDrawColor(18, 62, 50);
        doc.line(20, 115, 190, 115);
        
        // Pie de página
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("¡Gracias por confiar el cuidado de tu mascota en nosotros!", 105, 125, null, null, "center");

        // --- VISUALIZAR EN NUEVA PESTAÑA ---
        // Convertimos el documento a un objeto tipo Blob (archivo en memoria)
        const pdfBlob = doc.output('blob');
        
        // Creamos una URL temporal para ese archivo
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Abrimos esa URL en una nueva pestaña
        window.open(pdfUrl, '_blank');
    }
}

// =========================================
// BOTÓN MIS CITAS
// =========================================

if (btnMisCitas) {

    btnMisCitas.addEventListener(
        "click",
        function () {

            mostrarMisCitas();


            // Cerrar Mi cuenta
            const cuenta =
                bootstrap.Modal.getOrCreateInstance(
                    modalCuenta
                );

            cuenta.hide();


            // Abrir Mis citas
            setTimeout(
                function () {

                    const citas =
                        bootstrap.Modal.getOrCreateInstance(
                            modalMisCitas
                        );

                    citas.show();

                },
                300
            );

        }
    );

}


// =========================================
// INICIALIZAR CALENDARIO (FLATPICKR)
// =========================================
if (fechaCita && window.flatpickr) {
    const configIdioma = (flatpickr.l10ns && flatpickr.l10ns.es) ? flatpickr.l10ns.es : "default";

    flatpickr(fechaCita, {
        locale: configIdioma,
        dateFormat: "d/m/Y",
        minDate: "today",
        disableMobile: true,
        disable: [
            function(date) {
                // Desactiva los domingos (0 es Domingo en JavaScript)
                return (date.getDay() === 0);
            }
        ]
    });
}

// =========================================
// REGISTRO
// =========================================

const formRegistro =
    document.getElementById(
        "formRegistro"
    );


if (formRegistro) {

    formRegistro.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nombreRegistro =
                document.getElementById(
                    "nombreRegistro"
                );

            const correoRegistro =
                document.getElementById(
                    "correoRegistro"
                );

            const telefonoRegistro =
                document.getElementById(
                    "telefonoRegistro"
                );

            const passwordRegistro =
                document.getElementById(
                    "passwordRegistro"
                );

            const confirmPasswordRegistro =
                document.getElementById(
                    "confirmPasswordRegistro"
                );

            const terminosRegistro =
                document.getElementById(
                    "terminosRegistro"
                );


            // Limpiar errores
            nombreRegistro.classList.remove(
                "is-invalid"
            );

            correoRegistro.classList.remove(
                "is-invalid"
            );

            telefonoRegistro.classList.remove(
                "is-invalid"
            );

            passwordRegistro.classList.remove(
                "is-invalid"
            );

            confirmPasswordRegistro.classList.remove(
                "is-invalid"
            );

            terminosRegistro.classList.remove(
                "is-invalid"
            );


            let hayErrores = false;


            // Nombre
            if (
                nombreRegistro.value.trim() === ""
            ) {

                nombreRegistro.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            } else if (
                !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
                    .test(
                        nombreRegistro.value.trim()
                    )
            ) {

                nombreRegistro.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorNombreRegistro"
                ).textContent =
                    "El nombre solo puede contener letras.";

                hayErrores = true;

            }


            // Correo
            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
                        correoRegistro.value.trim()
                    )
            ) {

                correoRegistro.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Teléfono
            if (
                !/^\d{9,10}$/.test(
                    telefonoRegistro.value.trim()
                )
            ) {

                telefonoRegistro.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Contraseña
            if (
                passwordRegistro.value.length < 6
            ) {

                passwordRegistro.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


            // Confirmar contraseña
            if (
                confirmPasswordRegistro.value.trim() === ""
            ) {

                confirmPasswordRegistro.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorConfirmPasswordRegistro"
                ).textContent =
                    "Debes confirmar tu contraseña.";

                hayErrores = true;

            } else if (
                passwordRegistro.value !==
                confirmPasswordRegistro.value
            ) {

                confirmPasswordRegistro.classList.add(
                    "is-invalid"
                );

                document.getElementById(
                    "errorConfirmPasswordRegistro"
                ).textContent =
                    "Las contraseñas no coinciden.";

                hayErrores = true;

            }


            // Términos
            if (
                !terminosRegistro.checked
            ) {

                terminosRegistro.classList.add(
                    "is-invalid"
                );

                hayErrores = true;

            }


// Guardar usuario
            if (!hayErrores) {
                const usuariosGuardados = obtenerUsuariosGuardados();
                const correoIngresado = correoRegistro.value.trim().toLowerCase();
                
                // Verificar si el correo ya existe
                const existeCorreo = usuariosGuardados.some(u => u.correo.toLowerCase() === correoIngresado);
                
                if (existeCorreo) {
                    correoRegistro.classList.add("is-invalid");
                    document.getElementById("errorCorreoRegistro").textContent = "Este correo ya está registrado en otra cuenta.";
                } else {
                    const nuevoUsuario = {
                        nombre: nombreRegistro.value.trim(),
                        correo: correoRegistro.value.trim(),
                        telefono: telefonoRegistro.value.trim(),
                        password: passwordRegistro.value
                    };

                    usuariosGuardados.push(nuevoUsuario);
                    localStorage.setItem("usuariosVeterinaria", JSON.stringify(usuariosGuardados));

                    // 1. Mostrar la notificación
                    mostrarNotificacion("¡Cuenta creada correctamente! Redirigiendo...", "success");
                    
                    // 2. Desactivar el botón para evitar doble clic
                    const btnSubmit = document.querySelector("#formRegistro button[type='submit']");
                    if(btnSubmit) btnSubmit.disabled = true;

                    // 3. Esperar 2.5 segundos y luego redirigir
                    setTimeout(function() {
                        window.location.href = "index.html";
                    }, 2500);
                }
            }
        }
    );

}

// =========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// =========================================
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Asegurarnos de obtener el botón, incluso si hacen clic en el ícono 'i'
        const button = e.currentTarget;
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'; 
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="fa-solid fa-eye"></i>'; 
        }
    });
});

// =========================================
// CERRAR MENÚ MÓVIL AL HACER CLIC EN UN ENLACE
// =========================================
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const menuToggler = document.getElementById('menuPrincipal');

navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
        if (menuToggler.classList.contains('show')) {
            const collapseInstance = bootstrap.Collapse.getInstance(menuToggler);
            if(collapseInstance) {
                collapseInstance.hide();
            }
        }
    });
});

// =========================================
// NOTIFICACIONES (TOASTS BOOTSTRAP)
// =========================================
function mostrarNotificacion(mensaje, tipo = "success") {
    const toastEl = document.getElementById('toastNotificacion');
    const toastMensaje = document.getElementById('toastMensaje');
    
    if (toastEl && toastMensaje) {
        // Cambiar el color según el tipo (success=verde, danger=rojo, warning=amarillo)
        toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
        toastMensaje.textContent = mensaje;
        
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }
}
// =========================================
// PAGOS (SIMULACIÓN)
// =========================================
const btnSimularPago = document.getElementById("btnSimularPago");

if (btnSimularPago) {
    const urlParams = new URLSearchParams(window.location.search);
    const idCita = Number.parseInt(urlParams.get("id"), 10);
    const citasGuardadas = JSON.parse(
        localStorage.getItem("citasVeterinaria")
    ) || [];
    const citaActualIndex = citasGuardadas.findIndex(cita => cita.id === idCita);

    if (citaActualIndex === -1) {
        alert("Error: Cita no encontrada.");
        window.location.href = "index.html";
    } else {
        const cita = citasGuardadas[citaActualIndex];
        const pagoServicio = document.getElementById("pagoServicio");
        const pagoMascota = document.getElementById("pagoMascota");
        const pagoMonto = document.getElementById("pagoMonto");

        if (pagoServicio) pagoServicio.textContent = cita.servicio;
        if (pagoMascota) pagoMascota.textContent = cita.mascota;

        const matchPrecio = cita.servicio.match(/\$([0-9.]+)/);
        if (matchPrecio && pagoMonto) {
            pagoMonto.textContent = `$${matchPrecio[1]}`;
        }

        btnSimularPago.addEventListener("click", function() {
            // Alerta de seguridad para el usuario
            const confirmar = confirm("⚠️ AVISO: Esta es una pasarela de pago simulada para demostración.\n\nPor favor, NO ingreses datos de tarjetas de crédito reales. ¿Deseas continuar con la simulación?");
            if (!confirmar) return; // Si cancela, detenemos el proceso

            btnSimularPago.style.display = "none";

            const btnCancelar = document.getElementById("btnCancelar");
            const pantallaCarga = document.getElementById("pantallaCarga");

            if (btnCancelar) btnCancelar.style.display = "none";
            if (pantallaCarga) pantallaCarga.style.display = "block";

            setTimeout(function() {
                citasGuardadas[citaActualIndex].pagado = true;
                citasGuardadas[citaActualIndex].transaccion =
                    `TX${Math.floor(Math.random() * 100000000)}`;
                localStorage.setItem(
                    "citasVeterinaria",
                    JSON.stringify(citasGuardadas)
                );

                sessionStorage.setItem("citaPagoConfirmado", "true");
                window.location.href = "index.html";
            }, 3000);
        });
    }
}

const pagoConfirmado = sessionStorage.getItem("citaPagoConfirmado");
if (pagoConfirmado === "true") {
    sessionStorage.removeItem("citaPagoConfirmado");

    mostrarMisCitas();

    const modalMisCitasElemento = document.getElementById("modalMisCitas");
    const pestanaPagadas = document.getElementById("pagadas-tab");

    if (modalMisCitasElemento && pestanaPagadas) {
        bootstrap.Tab.getOrCreateInstance(pestanaPagadas).show();
        bootstrap.Modal.getOrCreateInstance(modalMisCitasElemento).show();
    }

    mostrarNotificacion("¡Pago aprobado! La cita está en Historial (Pagadas).", "success");
}

// =========================================
// INICIALIZAR ANIMACIONES (AOS)
// =========================================
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,   // Duración de la animación (0.8 segundos)
        once: true,      // Si es 'true', la animación solo ocurre una vez al bajar
        offset: 100      // Distancia (en px) antes de que la animación se dispare
    });
}