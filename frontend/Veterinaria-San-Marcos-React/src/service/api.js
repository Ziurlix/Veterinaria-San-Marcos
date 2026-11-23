const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const MENSAJES_HTTP = {
  // 2xx - Éxito
  200: "Solicitud completada correctamente.",
  201: "Recurso creado con éxito.",
  202: "Solicitud aceptada y en proceso.",
  204: "Operación completada sin contenido que mostrar.",
  206: "Contenido parcial entregado correctamente.",
  // 3xx - Redirecciones
  301: "El recurso se movió de forma permanente.",
  302: "El recurso fue redirigido temporalmente.",
  304: "El contenido no ha cambiado.",
  // 4xx - Errores del cliente
  400: "Los datos enviados no son válidos. Revisa el formulario.",
  401: "Tu sesión expiró o no has iniciado sesión.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No se encontró el recurso solicitado.",
  408: "La solicitud tardó demasiado. Intenta de nuevo.",
  409: "Ya existe un conflicto con los datos (por ejemplo, horario o correo duplicado).",
  422: "No se pudieron procesar los datos enviados.",
  429: "Demasiadas solicitudes seguidas. Espera un momento.",
  // 5xx - Errores del servidor
  500: "Error interno en el servidor. Intenta más tarde.",
  502: "El servidor no respondió correctamente (Bad Gateway).",
  503: "El servicio no está disponible en este momento.",
  504: "El servidor tardó demasiado en responder."
};

export class HttpError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;

    if (status >= 500) this.tipo = "SERVER_ERROR"; 
    else if (status >= 400) this.tipo = "CLIENT_ERROR";
    else if (status >= 300) this.tipo = "REDIRECT";
    else this.tipo = "UNKNOWN";
  }
}

async function manejarRespuesta(res, mensajeDefault = "Error al conectar con el servidor") {
  if (res.status === 204) {
    return null;
  }

  const texto = await res.text();
  let data = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = { mensaje: texto };
    }
  }

  if (res.ok) {
    return data;
  }

  const mensajePorCodigo = MENSAJES_HTTP[res.status];
  const mensajePorRango =
    res.status >= 500
      ? "Error en el servidor. Intenta nuevamente más tarde."
      : res.status >= 400
      ? "Hubo un problema con la solicitud."
      : res.status >= 300
      ? "La solicitud fue redirigida inesperadamente."
      : mensajeDefault;

  throw new HttpError(
    res.status,
    data?.mensaje || mensajePorCodigo || mensajePorRango,
    data
  );
}

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Registro
export async function registrarUsuario(datos) {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res, "Error al registrar");
}

// Login
export async function iniciarSesion(correo, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });
  const data = await manejarRespuesta(res, "Credenciales incorrectas");

  // Guardas el token y el usuario para usarlos en la app
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));
  return data;
}

// Obtener citas del usuario (o todas si es ADMIN)
export async function obtenerCitas() {
  const res = await fetch(`${API_URL}/citas`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return manejarRespuesta(res, "Error al cargar las citas");
}

// Crear cita
export async function crearCitaApi(datosCita) {
  const res = await fetch(`${API_URL}/citas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(datosCita),
  });
  return manejarRespuesta(res, "Error al agendar la cita");
}

// Obtener horas ocupadas de todos los usuarios para una fecha puntual
export async function obtenerHorasOcupadasApi(fecha) {
  const res = await fetch(`${API_URL}/citas/ocupadas?fecha=${encodeURIComponent(fecha)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return manejarRespuesta(res, "Error al consultar horarios");
}

// Editar cita
export async function actualizarCitaApi(id, datosCita) {
  const res = await fetch(`${API_URL}/citas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(datosCita),
  });
  return manejarRespuesta(res, "Error al actualizar la cita");
}

// Eliminar cita
export async function eliminarCitaApi(id) {
  const res = await fetch(`${API_URL}/citas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return manejarRespuesta(res, "Error al eliminar la cita");
}