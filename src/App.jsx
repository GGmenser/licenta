import './App.css';
<<<<<<< HEAD
import {Routes,Route } from 'react-router-dom';
import './Components/Button.css';
import Navbar from './Components/Navbar';
=======
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import './Components/Button.css';
import {Routes,Route } from 'react-router-dom';
>>>>>>> ae087eb31ebb771aacacd401d2592b2b9ced9e78
import Home from './pages/Home';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';
<<<<<<< HEAD
import Test from './pages/test';
import Footer from './Components/Footer';
=======
>>>>>>> ae087eb31ebb771aacacd401d2592b2b9ced9e78


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
<<<<<<< HEAD
          <Route path="/test" element={<Test />} />
=======
>>>>>>> ae087eb31ebb771aacacd401d2592b2b9ced9e78
        </Routes>
      </div>
      <Footer />
    </>
  
  );
}

export default App;
