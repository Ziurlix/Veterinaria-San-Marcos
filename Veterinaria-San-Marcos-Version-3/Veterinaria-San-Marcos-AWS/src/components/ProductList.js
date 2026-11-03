import React from 'react';
import { services } from '../data';

export default function ProductList({ onSolicitarServicio }) {
  return (
    <section id="servicios">
      <div className="container">
        <div className="section-title">
          <h2>Nuestros servicios</h2>
          <p>Servicios disponibles para el cuidado de tu mascota</p>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <div className={`col-md-6 ${index > 2 ? 'col-lg-6' : 'col-lg-4'}`} key={service.id}>
              <article className="card service-card h-100">
                <div className="card-body">
                  <div className="service-icon" aria-hidden="true">{service.icon}</div>
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-text">{service.description}</p>
                  <div className="d-flex justify-content-between text-muted small my-2 px-1 service-meta">
                    <span>{service.duration}</span>
                    <strong className="text-success">{service.price}</strong>
                  </div>
                  <button type="button" className="btn btn-primary btnServicio" onClick={() => onSolicitarServicio(service.title)}>
                    Solicitar servicio
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
