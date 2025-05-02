import React, { useRef } from 'react';
import emailjs from "emailjs-com";
import './Form.css';

const Form = () => {
  const form = useRef();

  const sendForm = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_6bfgli8', 'template_uo88vou', form.current, 'jAHZ3pVGQ3T73ZiTH')
      .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
  }


    let popup = document.getElementById("popup");
        function openPopup(){
            popup.classList.add("open-popup");
            setTimeout(() => {
                popup.classList.remove("open-popup");
                }, 2500);
        }

  return (
    <form id="contactForm" className="contactForm" ref={form} onSubmit={sendForm}>
      <input type="text" id="firstName" placeholder="First Name (Required)" name="FirstName" required />
      <input type="text" id="lastName" placeholder="Last Name (Required)" name="LastName" required /> 
      <input type="email" id="email" placeholder="Email (Required)" name="email" required />
      <input type="tel" id="phone" placeholder="Phone" name="phone" />
      <textarea type="text" id="message" placeholder="Message (Required)" name="message" rows={10}/>
      <button type="submit" onClick={openPopup} value="Send">Send</button>
    </form>
  )
}

export default Form
