// src/Components/Form.jsx
import React, { useRef, useState } from "react";
import emailjs from "emailjs-com";
import "./Form.css";

const Form = ({ onSuccess }) => {
  const form = useRef();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const sendForm = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await emailjs.sendForm(
        "service_6bfgli8",
        "template_uo88vou",
        form.current,
        "jAHZ3pVGQ3T73ZiTH"
      );
      form.current.reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      id="contactForm"
      className="contactForm"
      ref={form}
      onSubmit={sendForm}
    >
      <input
        type="text"
        id="firstName"
        placeholder="First Name (Required)"
        name="FirstName"
        required
      />
      <input
        type="text"
        id="lastName"
        placeholder="Last Name (Required)"
        name="LastName"
        required
      />
      <input
        type="email"
        id="email"
        placeholder="Email (Required)"
        name="email"
        required
      />
      <input type="tel" id="phone" placeholder="Phone" name="phone" />
      <textarea
        id="message"
        placeholder="Message (Required)"
        name="message"
        rows={10}
        required
      />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button type="submit" disabled={sending} aria-busy={sending}>
        {sending ? (
          <span className="btn-spinner" aria-hidden="true"></span>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
};

export default Form;
