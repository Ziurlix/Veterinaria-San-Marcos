import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ModalLogin from './components/ModalLogin';
import ModalCuenta from './components/ModalCuenta';
import ModalCita from './components/ModalCita';
import ModalMisCitas from './components/ModalMisCitas';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Pago from './pages/Pago';
import PagoRetorno from './pages/PagoRetorno';

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago-retorno" element={<PagoRetorno />} />
        </Routes>
      </main>
      <Footer />
      <ModalLogin />
      <ModalCuenta />
      <ModalCita />
      <ModalMisCitas />
    </Router>
  );
}

export default App;