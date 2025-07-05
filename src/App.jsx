import './App.css';
import {Routes,Route } from 'react-router-dom';
import './Components/Button.css';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';
import Test from './pages/test';
import Footer from './Components/Footer';


function App() {
  
  return (
    <>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </div>
      <Footer />
    </>
  
  );
}

export default App;
