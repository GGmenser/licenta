// src/components/Footer.jsx
import "./Footer.css";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <nav className="footer__col" aria-label="Customers">
          <h3 className="footer__title">CUSTOMERS</h3>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href="#">
                FAQ
              </a>
            </li>

            <li>
              <a className="footer__link" href="#">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="footer__link" href="#">
                Terms
              </a>
            </li>
            <li>
              <a className="footer__link" href="#">
                Accessibility
              </a>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Company">
          <h3 className="footer__title">COMPANY</h3>
          <ul className="footer__list">
            <li>
              <Link to="/about" className="footer__link">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="footer__link">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/product" className="footer__link">
                Our Product
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="footer__link">
                Pricing
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Contact us">
          <h3 className="footer__title">CONTACT US</h3>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href="tel:+400773824321">
                +40 0773 824 321
              </a>
            </li>
            <li>
              <p>
                Email Us: <br />
              </p>
              <a className="footer__link" href="mailto:support@monochrome.com">
                support@monochrome.com
              </a>
            </li>
            <li>
              <span className="footer__muted">
                Working Hours:
                <br />
                Mon–Fri 9am–5pm
              </span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer__legal">
        <span>© {year} Monocrome</span>
      </div>
    </footer>
  );
}
