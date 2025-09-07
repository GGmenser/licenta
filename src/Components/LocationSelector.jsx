import React, { useState } from "react";
import Globe3D from "./Globe3D";
import "./LocationSelector.css";
import BotPrice from "./BotPrice";
import axios from "axios";

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGlobeClick = async ({ lat, lng }) => {
    setLoading(true);
    setError("");
    setEstimate(null);

    const [geocodeRes, weatherRes] = await Promise.allSettled([
      axios.get("/api/geocode", { params: { lat, lng }, timeout: 6000 }),
      axios.get("/api/weather", { params: { lat, lng }, timeout: 6000 }),
    ]);

    let locationName = "";
    let weatherInfo = "";
    let countryCode = null;
    let countryName = null;
    let city = null;

    if (geocodeRes.status === "fulfilled") {
      const data = geocodeRes.value.data;
      const comp = data?.results?.[0]?.components || {};
      city =
        comp.city ||
        comp.town ||
        comp.village ||
        comp.hamlet ||
        comp.suburb ||
        comp.county ||
        comp.state ||
        null;
      countryName = comp.country || null;
      countryCode = comp["ISO_3166-1_alpha-2"] || comp.country_code || null;

      if (city || countryName) {
        locationName = city
          ? `${city}${countryName ? ", " + countryName : ""}`
          : countryName;
      }
    }

    if (weatherRes.status === "fulfilled") {
      const w = weatherRes.value.data;
      const desc = w?.weather?.[0]?.description;
      const temp = w?.main?.temp;
      if (desc != null && temp != null) {
        weatherInfo = `${desc}, ${Math.round(temp)}°C`;
      }
      if (!locationName) {
        const nm = w?.name;
        const cc = w?.sys?.country;
        if (nm) locationName = cc ? `${nm}, ${cc}` : nm;
      }
    }

    if (!locationName) locationName = "Unknown location";
    if (!weatherInfo) weatherInfo = "Weather unavailable";

    // ⬇️ Acesta e contextul trimis către BotPrice
    setLocationInfo({ lat, lng, name: locationName, weather: weatherInfo });

    setLoading(false);
  };

  return (
    <div className="location-selector-container">
      <Globe3D onClick={handleGlobeClick} />
      {/* ⬇️ PASAREA CONTEXTULUI CĂTRE BOT */}
      <BotPrice context={locationInfo} />

      {locationInfo && (
        <div className="location-info-box">
          <p>
            <strong>Location: </strong> {locationInfo.name}
          </p>
          <p>
            <strong>Weather: </strong>
            {locationInfo.weather}
          </p>
        </div>
      )}

      {loading && <p>Calculating price estimate...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {estimate && !error && (
        <div className="location-estimate-box">
          <h3>
            Estimated price: ~
            {estimate.estimate.total_with_vat.toLocaleString("en-US")}{" "}
            {estimate.estimate.currency}
          </h3>
          <p>
            (Materials & labor:{" "}
            {estimate.estimate.materials_and_labor.toLocaleString("en-US")} +
            Transport: {estimate.estimate.transport.toLocaleString("en-US")} +
            Install:{" "}
            {estimate.breakdown.installation_fee.toLocaleString("en-US")} ; VAT:{" "}
            {(estimate.breakdown.vat_rate * 100).toFixed(0)}%)
          </p>

          <h4>Advantages of building here:</h4>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {estimate.advantages_markdown}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
