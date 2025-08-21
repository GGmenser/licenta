export default function About() {
return <>
  <div className="default">
    <div className="left center">
      <img
        className="v-image"
        src="Galerie/Casa 6 Poza (1)_enhanced.avif"
        alt="Casa"
      />
    </div>
    <div className="right center">
      <div style={{ fontSize: "20pt", padding: 30 }} className="about-text">
        <h1>Who we are</h1>
        <br />
        <br />
        <p>
          Monochrome is a cutting-edge Romanian brand from Cluj-Napoca,
          dedicated to transforming the way people live. We specialize in the
          design and production of{" "}
          <b>sustainable, prefabricated living units</b>, offering a{" "}
          <b>modern, eco-friendly</b> approach to housing. With a focus on both{" "}
          <b>functionality and aesthetics</b>, our units blend minimalist design
          with the latest in green technologies.
        </p>
      </div>
    </div>
  </div>
  <div
    className="mainImage" style={{
      backgroundImage: 'url("Galerie/Casa 3 Poza (11)_enhanced.avif")',
      height: "55vh"
    }}
  >
    <div
      className="text"
      style={{ background: "rgb(0,0,0,0.5)", height: "100%", width: "100%" }}
    >
      <div>
        <h1 style={{ color: "antiquewhite", fontSize: "48pt" }}>Get Started</h1>
        <br />
        <a href="contact.html">
          <button className="about-button">CONTACT US</button>
        </a>
      </div>
    </div>
  </div>
</>


}