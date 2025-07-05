import './Home.css';
import {Link} from 'react-router-dom'
export default function Home() {
    return <>
    <div
      className="mainImage"
      style={{ backgroundImage: 'url("Galerie/Poza1.jpeg")' }}
    >
      <div
        className="center"
        style={{ background: "rgb(0,0,0,0.3)", height: "100%", width: "100%" }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", fontWeight: "lighter", fontSize: "50pt" }}>
            Instant Quality{" "}
          </h1>
          <p style={{ color: "white", textAlign: "center" }}>
            Affordable luxury modular homes, crafted with meticulous attention to
            detail and built at remarkable speed.
          </p>
          <br />
          <br />
          <Link to="/contact">
            <button className="index-button">View Details</button>
          </Link>
        </div>
      </div>
    </div>
    <div className="default">
      <div className="left center o2">
        <img className="h-image hide" src="Galerie/Poza3.jpg" alt="Casa" />
      </div>
      <div className="right center o1">
        <div style={{ padding: 30 }}>
          <h1 style={{ paddingBottom: 30 }}>Why Monochrome?</h1>
          <ol>
            <li>
              <b>Quick Installation</b>
              <br />
              Monochrome units are fully plug-and-play, meaning they are ready for
              immediate use with minimal on-site construction, unlike normal
              housing, which can take months or even years to complete.
            </li>
            <li>
              <b>Energy Efficiency</b>
              <br />
              With superior insulation (using eco-friendly materials like Ecowool
              and C24 timber), Monochrome units achieve excellent U-values (as low
              as 0.16 W/m²K), making them more energy-efficient than typical
              homes.
            </li>
            <li>
              <b>Cost-Effectiveness</b>
              <br />
              Prefabricated construction tends to be more cost-effective due to
              streamlined production and reduced labor costs. Monochrome units
              also save energy, which reduces long-term utility bills.
            </li>
            <li>
              <b>Modern Design and Flexibility</b>
              <br />
              Monochrome units offer sleek, modern interiors with high-quality
              finishes like oak flooring, designer lighting, and custom kitchens,
              which can often be more challenging and costly to achieve in
              traditional builds. Plus, they can be relocated or expanded more
              easily.
            </li>
            <li>
              <b>Sustainability</b>
              <br />
              These units use eco-conscious materials such as natural wool
              insulation and certified sustainable timber, reducing their
              environmental footprint compared to conventional construction
              methods, which often use less sustainable resources.
            </li>
          </ol>
          <div className="center">
            <Link to="/contact"><button>Contact Us!</button></Link>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 30
        }}
      >
        <h1>Follow Us On Social</h1>
      </div>
      <div className="social">
        <img className="soc" src="Galerie/Poza1.jpeg" />
        <img className="soc" src="Galerie/Poza2.jpg" />
        <img className="soc" src="Galerie/Poza3.jpg" />
        <img className="soc" src="Galerie/Poza3.jpg" />
      </div>
      <div className="center" style={{ padding: 30 }}>
        <button onClick={() => window.open('https://www.instagram.com/mymonochrome_prefab/', '_blank')}>
          Social
        </button>
      </div>
    </div>
    </>
}