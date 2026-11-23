import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Contacto() {
  const { solicitarAperturaCita } = useContext(AppContext);

  return (
    <>
      <span id="ubicacion" aria-hidden="true"></span>
      <div className="visit-grid" data-aos="fade-up">
        <div className="visit-copy">
          <p className="eyebrow">UBICACIÓN · RANCAGUA, O'HIGGINS</p>
          <h2 id="location-title">Visítanos</h2>
          <p className="visit-intro">Estamos aquí para cuidar a tu mascota. Llámanos o agenda una hora con nuestro equipo.</p>

          <div className="visit-details">
            <div className="visit-detail">
              <span className="visit-detail-icon" aria-hidden="true">
                <i className="fa-solid fa-location-dot text-danger"></i>
              </span>
              <div>
                <span className="visit-detail-label">Dirección</span>
                <p>Rancagua, Región de O'Higgins</p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="visit-detail-icon" aria-hidden="true">
                <i className="fa-solid fa-phone text-success"></i>
              </span>
              <div>
                <span className="visit-detail-label">Teléfono</span>
                <p>
                  <a href="tel:+56912345678" className="text-decoration-none text-reset">
                    +56 9 1234 5678
                  </a>
                </p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="visit-detail-icon" aria-hidden="true">
                <i className="fa-regular fa-clock text-primary"></i>
              </span>
              <div>
                <span className="visit-detail-label">Horario</span>
                <p>Lunes a sábado: 09:00 a 19:00 hrs</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg mt-3"
            onClick={() => solicitarAperturaCita('')}
          >
            Agendar consulta
          </button>
        </div>

        <div className="visit-map">
          <iframe
            src="https://www.google.com/maps?q=Rancagua,%20Chile&output=embed"
            title="Mapa de ubicación en Rancagua"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen=""
          ></iframe>
        </div>
      </div>
    </>
  );
}