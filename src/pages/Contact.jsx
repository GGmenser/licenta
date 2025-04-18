import Form from "../Components/Form"
export default function Contact() {
    let popup = document.getElementById("popup");
        function openPopup(){
            popup.classList.add("open-popup");
            setTimeout(() => {
                popup.classList.remove("open-popup");
                }, 2500);
        }
    return <>
    <div className="default">
        <div className="left  center contact-form">
            <div className="phoneContact">
                <h1 style={{ fontSize: "40pt" }}>Contact Us</h1><br /><br /><br />
                <p>If you’re interested in purchasing a Monochrome prefabricated living unit or would like to learn more, please fill out the form below.</p>
                <Form />
            </div>
        </div>
        <div className="right center" style={{ marginRight: "0%" }}>
            <img className="contact-image"  src="Galerie/Casa 6 Poza (9)_enhanced.jpg" alt="Monochrome Interior" />
        </div>
    </div>

    <div id="popup" className="popup">
            <h2>Thank You!</h2>
            <p>Your message has been sent successfully.</p>
    </div>
    </>
}