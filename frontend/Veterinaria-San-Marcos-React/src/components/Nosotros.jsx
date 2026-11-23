export default function Nosotros() {
  return (
    <section id="nosotros">
      <div className="container">
        <div className="about-content">
          {/* Las etiquetas <img> deben cerrarse con /> al final */}
          <img className="about-image" src="/img/jackielsy-dog.jpg" alt="Cachorros Golden Retriever" data-aos="fade-right" data-aos-duration="1000" />
          
          <div className="about-text" data-aos="fade-left" data-aos-duration="1000">
            <h2>¿Quiénes somos?</h2>
            <p className="about-subtitle">Conoce más sobre Veterinaria San Marcos</p>
            <p>
               Somos Veterinaria San Marcos, una clínica médica fundada en 2009 en la ciudad de Rancagua, 
               Región del Libertador General Bernardo O'Higgins. Nuestro principal compromiso es el bienestar integral de las
               mascotas domésticas, dedicándonos al cuidado de perros, gatos, conejos y aves.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}