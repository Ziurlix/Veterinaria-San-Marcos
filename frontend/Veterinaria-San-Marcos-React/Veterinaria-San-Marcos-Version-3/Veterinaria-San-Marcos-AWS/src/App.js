import React, { useEffect, useMemo, useState } from 'react';
import Navigation from './components/Navbar';
import ProductList from './components/ProductList';
import RegistrationForm from './components/RegistrationForm';
import ShoppingCart from './components/ShoppingCart';
import LoginForm from './components/LoginForm';
import AppointmentForm from './components/AppointmentForm';
import ModalShell from './components/ModalShell';

const readJson = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_error) {
    return fallback;
  }
};

const getInitialUser = () => {
  try {
    if (sessionStorage.getItem('usuarioLogueado') !== 'true') return null;
    return readJson('usuarioVeterinaria', null);
  } catch (_error) {
    return null;
  }
};

export default function App() {
  const [usuario, setUsuario] = useState(getInitialUser);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);
  const [showCuenta, setShowCuenta] = useState(false);
  const [showCitas, setShowCitas] = useState(false);
  const [showFormularioCita, setShowFormularioCita] = useState(false);
  const [categoriaInicial, setCategoriaInicial] = useState('');
  const [servicioPendiente, setServicioPendiente] = useState(null);
  const [loginNotice, setLoginNotice] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [citas, setCitas] = useState(() => {
    const stored = readJson('citasVeterinaria', []);
    return Array.isArray(stored) ? stored : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('citasVeterinaria', JSON.stringify(citas));
    } catch (_error) {
      // El prototipo continúa funcionando durante la sesión si el navegador bloquea el almacenamiento.
    }
  }, [citas]);

  useEffect(() => {
    if (!mensaje) return undefined;
    const timer = window.setTimeout(() => setMensaje(''), 5000);
    return () => window.clearTimeout(timer);
  }, [mensaje]);

  const misCitas = useMemo(
    () => (usuario ? citas.filter((cita) => cita.usuario === usuario.correo) : []),
    [citas, usuario]
  );

  const solicitarServicio = (categoria = '') => {
    setCategoriaInicial(categoria);
    if (usuario) {
      setShowFormularioCita(true);
    } else {
      setServicioPendiente(categoria);
      setLoginNotice('');
      setShowLogin(true);
    }
  };

  const iniciarSesion = (correo, password) => {
    const guardado = readJson('usuarioVeterinaria', null);
    if (!guardado || guardado.correo?.toLowerCase() !== correo.toLowerCase() || guardado.password !== password) {
      return false;
    }
    setUsuario(guardado);
    try { sessionStorage.setItem('usuarioLogueado', 'true'); } catch (_error) { /* sesión en memoria */ }
    setShowLogin(false);
    setLoginNotice('');
    if (servicioPendiente !== null) {
      setCategoriaInicial(servicioPendiente);
      setServicioPendiente(null);
      setShowFormularioCita(true);
    }
    return true;
  };

  const registrarUsuario = (nuevoUsuario) => {
    try { localStorage.setItem('usuarioVeterinaria', JSON.stringify(nuevoUsuario)); } catch (_error) { /* se mantiene el mensaje de confirmación */ }
    setShowRegistro(false);
    setLoginNotice('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
    setShowLogin(true);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setShowCuenta(false);
    try { sessionStorage.removeItem('usuarioLogueado'); } catch (_error) { /* sin acción */ }
    setMensaje('Has cerrado sesión correctamente.');
  };

  const guardarCita = (datosCita) => {
    if (!usuario) return;
    const nuevaCita = {
      ...datosCita,
      id: Date.now(),
      usuario: usuario.correo,
      estado: 'Pendiente'
    };
    setCitas((actuales) => [...actuales, nuevaCita]);
    setShowFormularioCita(false);
    setMensaje('Solicitud de cita enviada correctamente.');
  };

  const cancelarCita = (id) => {
    setCitas((actuales) => actuales.filter((cita) => cita.id !== id));
    setMensaje('La cita fue cancelada.');
  };

  return (
    <div className="App">
      <Navigation usuario={usuario} onLoginClick={() => { setLoginNotice(''); setShowLogin(true); }} onAccountClick={() => setShowCuenta(true)} />

      <main>
        <section id="inicio">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 hero-text">
                <h1>Cuidamos a quienes más quieres 🐾</h1>
                <p className="lead">Atención veterinaria profesional para el cuidado y bienestar de tus mascotas.</p>
                <p>Consulta nuestros servicios y solicita atención de manera rápida y sencilla.</p>
                <button type="button" className="btn btn-primary btn-lg" id="btnSolicitarCita" onClick={() => solicitarServicio('')}>
                  Solicitar una cita
                </button>
              </div>
              <div className="col-lg-6 hero-video-col mt-4 mt-lg-0">
                <video className="hero-video" autoPlay muted loop playsInline controls={false} poster="/logo512.png">
                  <source src="/video-portada.mp4" type="video/mp4" />
                  Tu navegador no soporta videos.
                </video>
              </div>
            </div>
          </div>
        </section>

        <section id="nosotros">
          <div className="container">
            <div className="section-title">
              <h2>¿Quiénes somos?</h2>
              <p>Conoce más sobre Veterinaria San Marcos</p>
            </div>
            <div className="about-content">
              <p>Veterinaria San Marcos es una clínica ubicada en Rancagua, dedicada al cuidado y bienestar de las mascotas.</p>
              <p>La clínica atiende principalmente perros y gatos, además de conejos y aves.</p>
              <p>Nuestro objetivo es entregar una atención profesional y cercana para cada mascota.</p>
            </div>
          </div>
        </section>

        <ProductList onSolicitarServicio={solicitarServicio} />

        <section id="ubicacion">
          <div className="container">
            <div className="section-title">
              <h2>📍 Nuestra ubicación</h2>
              <p>Visítanos en Veterinaria San Marcos</p>
            </div>
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <div className="contact-card">
                  <h3>Veterinaria San Marcos</h3>
                  <p>📍 Rancagua, Región del Libertador Bernardo O'Higgins</p>
                  <p>📞 +56 9 1234 5678</p>
                  <p>🕒 Lunes a Sábado: 09:00 a 19:00 hrs</p>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="mapa-container">
                  <iframe title="Mapa de ubicación de Veterinaria San Marcos en Rancagua" src="https://www.google.com/maps?q=Rancagua,%20Chile&output=embed" loading="lazy" allowFullScreen />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto">
          <div className="container">
            <div className="section-title">
              <h2>Contacto</h2>
              <p>Estamos para ayudarte</p>
            </div>
            <div className="contact-card">
              <p>📍 <strong>Ubicación:</strong> Rancagua, Región de O'Higgins</p>
              <p>📞 <strong>Teléfono:</strong> +56 9 1234 5678</p>
              <p>📧 <strong>Correo:</strong> contacto@veterinariasanmarcos.cl</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container text-center">
          <p className="mb-1">🐾 Veterinaria San Marcos</p>
          <p className="mb-0">© 2026 Veterinaria San Marcos. Todos los derechos reservados.</p>
        </div>
      </footer>

      {mensaje && <div className="app-toast alert alert-success" role="status">{mensaje}</div>}

      <LoginForm
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={iniciarSesion}
        onOpenRegister={() => { setShowLogin(false); setShowRegistro(true); }}
        notice={loginNotice}
      />

      <RegistrationForm
        show={showRegistro}
        onClose={() => setShowRegistro(false)}
        onRegister={registrarUsuario}
      />

      <AppointmentForm
        show={showFormularioCita}
        onClose={() => setShowFormularioCita(false)}
        categoriaInicial={categoriaInicial}
        onSubmit={guardarCita}
      />

      <ModalShell
        show={showCuenta}
        onClose={() => setShowCuenta(false)}
        title="👤 Mi cuenta"
        footer={
          <>
            <button type="button" className="btn btn-primary" onClick={() => { setShowCuenta(false); setShowCitas(true); }}>📅 Mis citas</button>
            <button type="button" className="btn btn-danger" onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        }
      >
        {usuario && <>
          <div className="cuenta-dato"><strong>Nombre:</strong><span>{usuario.nombre}</span></div>
          <div className="cuenta-dato"><strong>Correo:</strong><span>{usuario.correo}</span></div>
          <div className="cuenta-dato"><strong>Teléfono:</strong><span>{usuario.telefono}</span></div>
        </>}
      </ModalShell>

      <ShoppingCart show={showCitas} onClose={() => setShowCitas(false)} citas={misCitas} onCancelarCita={cancelarCita} />
    </div>
  );
}
