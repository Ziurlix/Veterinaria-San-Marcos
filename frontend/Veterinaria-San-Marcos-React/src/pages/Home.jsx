import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Hero from '../components/Hero';
import Nosotros from '../components/Nosotros';
import Servicios from '../components/Servicios';
import Contacto from '../components/Contacto';

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }, []);

  return (
    <>
      <Hero />
      <Nosotros />
      
      <section id="servicios">
        <Servicios />
      </section>
      
      <section id="contacto" className="location-section overflow-hidden">
        <Contacto />
      </section>
    </>
  );
}