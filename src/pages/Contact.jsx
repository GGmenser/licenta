// src/pages/Contact.jsx
import { useEffect, useRef, useState } from "react";
import Form from "../Components/Form";

export default function Contact() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  // închidere automată după 2.5s când se deschide
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 2500);
    return () => clearTimeout(t);
  }, [open]);

  // închidere cu Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="default">
        <div className="left center contact-form">
          <div className="phoneContact">
            <h1 style={{ fontSize: "40pt" }}>Contact Us</h1>
            <br />
            <br />
            <br />
            <p>
              If you’re interested in purchasing a Monochrome home or would like
              to learn more, please fill out the form below.
            </p>
            <br />
            <Form onSuccess={() => setOpen(true)} />
          </div>
        </div>
        <div className="right center" style={{ marginRight: "0%" }}>
          <img
            className="contact-image"
            src="Galerie/Casa 6 Poza (9)_enhanced.avif"
            alt="Monochrome Interior"
          />
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="popup-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`popup ${open ? "open-popup" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        aria-describedby="popup-desc"
      >
        <svg className="popup-check" viewBox="0 0 52 52" aria-hidden="true">
          <path
            d="M14 27 l8 8 l16 -16"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <h2 id="popup-title">Thank you!</h2>
        <p id="popup-desc">Your message has been sent successfully.</p>
      </div>
    </>
  );
}
