export default function Footer() {
  return (
    <footer className="pt-5 pb-4">
      <div className="container" data-aos="fade-in" data-aos-duration="1200">
        <div className="row text-center text-md-start">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="fa-solid fa-paw me-2"></i> Veterinaria San Marcos
            </h5>
            <p className="text-white-50 mb-2">
              Comprometidos con el bienestar integral de tus mascotas desde 2009. Cuidado profesional, ético y con mucho amor.
            </p>
            <p className="text-white-50 small mb-0">
              <i className="fa-solid fa-location-dot me-2"></i>
              Av. San Marcos 1420, Santiago, Chile
            </p>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="fw-bold mb-3">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/#inicio" className="text-white-50 text-decoration-none footer-link">Inicio</a>
              </li>
              <li className="mb-2">
                <a href="/#nosotros" className="text-white-50 text-decoration-none footer-link">Nosotros</a>
              </li>
              <li className="mb-2">
                <a href="/#servicios" className="text-white-50 text-decoration-none footer-link">Servicios</a>
              </li>
              <li className="mb-2">
                <a href="/#contacto" className="text-white-50 text-decoration-none footer-link">Contacto</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12 mb-4">
            <h5 className="fw-bold mb-3">Horario y Contacto</h5>
            <p className="text-white-50 mb-1">
              <i className="fa-regular fa-clock me-2"></i>
              Lunes a Sábado: 09:00 - 19:00 hrs
            </p>
            <p className="text-white-50 mb-2">
              <i className="fa-solid fa-kit-medical me-2"></i>
              Domingo: Solo urgencias
            </p>
            <p className="mb-3">
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-decoration-none"
              >
                <i className="fa-brands fa-whatsapp text-success me-2"></i>
                +56 9 1234 5678
              </a>
            </p>
            <div className="d-flex justify-content-center justify-content-md-start gap-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-sm"
                aria-label="Facebook de Veterinaria San Marcos"
              >
                <i className="fa-brands fa-facebook me-1"></i> Facebook
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-sm"
                aria-label="Instagram de Veterinaria San Marcos"
              >
                <i className="fa-brands fa-instagram me-1"></i> Instagram
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary mt-2 mb-4" />

        <div className="text-center text-white-50">
          <small>© 2026 Veterinaria San Marcos. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
}