import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Hero() {
  const { solicitarAperturaCita } = useContext(AppContext);

  return (
    <section id="inicio">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 hero-text">
            <h1>
              Cuidamos a quienes más quieres <i className="fa-solid fa-heart text-danger ms-2"></i>
            </h1>
            <p className="lead">
              Atención veterinaria profesional para el cuidado y bienestar de tus mascotas.
            </p>
            <p>Consulta nuestros servicios y solicita atención de manera rápida y sencilla.</p>
            <div className="d-grid gap-2 d-sm-flex mt-3">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => solicitarAperturaCita('')}
              >
                <i className="fa-regular fa-calendar-check me-2"></i>
                Solicitar una cita
              </button>
              <a href="/#servicios" className="btn btn-outline-light btn-lg btn-ver-servicios">
                Ver servicios
              </a>
            </div>
          </div>
          <div className="col-lg-6 hero-video-col mt-4 mt-lg-0">
            <video className="hero-video" autoPlay muted loop playsInline poster="/img/pt_negro.jpg">
              <source src="/video/video-portada.mp4" type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}