import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const SERVICIOS = [
  {
    titulo: 'Consulta General',
    descripcion: 'Atención general, urgencias, control postoperatorio y atención para aves y conejos.',
    duracion: '20 - 40 minutos',
    icono: 'fa-solid fa-stethoscope text-success',
    delay: '100'
  },
  {
    titulo: 'Vacunación',
    descripcion: 'Antirrábica, séxtuple, Bordetella, bivalente, triple felina y refuerzos anuales.',
    duracion: '~10 minutos',
    icono: 'fa-solid fa-syringe text-primary',
    delay: '200'
  },
  {
    titulo: 'Cirugía',
    descripcion: 'Esterilizaciones, cesáreas de urgencia y extirpación de tumores con anestesia.',
    duracion: '45 - 90 minutos',
    icono: 'fa-solid fa-heart-pulse text-danger',
    delay: '300'
  },
  {
    titulo: 'Desparasitación',
    descripcion: 'Tratamientos internos según especie y peso, además de antiparasitario externo.',
    duracion: '~5 minutos',
    icono: 'fa-solid fa-bug-slash text-warning',
    delay: '100'
  },
  {
    titulo: 'Exámenes clínicos',
    descripcion: 'Hemogramas, perfil bioquímico, radiografías, ecografías y test de leishmaniasis.',
    duracion: '20 - 30 minutos',
    icono: 'fa-solid fa-microscope text-info',
    delay: '200'
  },
  {
    titulo: 'Procedimientos y Cuidados',
    descripcion: 'Corte de uñas, microchip con registro, limpieza dental y hospitalización por día.',
    duracion: 'Duración variable',
    icono: 'fa-solid fa-kit-medical text-success',
    delay: '300'
  }
];

export default function Servicios() {
  const { solicitarAperturaCita } = useContext(AppContext);

  return (
    <div className="container">
      <div className="section-title">
        <h2>Nuestros servicios</h2>
        <p>Servicios disponibles para el cuidado de tu mascota</p>
      </div>

      <div className="row g-4 justify-content-center">
        {SERVICIOS.map((srv) => (
          <div
            key={srv.titulo}
            className="col-12 col-md-6 col-lg-4"
            data-aos="fade-up"
            data-aos-delay={srv.delay}
          >
            <article className="card service-card h-100">
              <div className="card-body d-flex flex-column">
                <div className="service-icon">
                  <i className={srv.icono}></i>
                </div>
                <h3 className="card-title">{srv.titulo}</h3>
                <p className="card-text">{srv.descripcion}</p>
                <div className="text-muted small my-2 px-1">
                  <i className="fa-regular fa-clock me-1"></i> {srv.duracion}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btnServicio mt-auto w-100"
                  onClick={() => solicitarAperturaCita(srv.titulo)}
                >
                  Solicitar servicio
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}