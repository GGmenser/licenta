import React from 'react';
import './Form.css';

function Form() {
    let popup = document.getElementById("popup");
        function openPopup(){
            popup.classList.add("open-popup");
            setTimeout(() => {
                popup.classList.remove("open-popup");
                }, 2500);
        }
  return (
    <form id="contactForm" className="contactForm">
      <input type="text" id="firstName" placeholder="First Name (Required)" required />
      <input type="text" id="lastName" placeholder="Last Name (Required)" required /> 
      <input type="email" id="email" placeholder="Email (Required)" required />
      <input type="tel" id="phone" placeholder="Phone" />
      <textarea id="message" placeholder="Message (Required)" required></textarea>
      <button type="button" onClick={openPopup}>Send</button>
    </form>
  )
}

export default Form
