import React, { useState } from "react";
import Globe3D from "./Globe3D";
import "./LocationSelector.css";
import axios from "axios";

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleGlobeClick = async ({ lat, lng }) => {
    const [geocodeRes, weatherRes] = await Promise.allSettled([
      axios.get("/api/geocode", { params: { lat, lng }, timeout: 6000 }),
      axios.get("/api/weather", { params: { lat, lng }, timeout: 6000 }),
    ]);

    let locationName = "";
    let weatherInfo = "";

    if (geocodeRes.status === "fulfilled") {
      const data = geocodeRes.value.data;
      const comp = data?.results?.[0]?.components || {};
      const city =
        comp.city ||
        comp.town ||
        comp.village ||
        comp.hamlet ||
        comp.suburb ||
        comp.county ||
        comp.state ||
        "";
      const country = comp.country || "";
      if (city || country) {
        locationName = city
          ? `${city}${country ? ", " + country : ""}`
          : country;
      }
    }

    if (weatherRes.status === "fulfilled") {
      const w = weatherRes.value.data;
      const desc = w?.weather?.[0]?.description;
      const temp = w?.main?.temp;
      if (desc != null && temp != null) {
        weatherInfo = `${desc}, ${Math.round(temp)}°C`;
      }
      // fallback name from OpenWeather if geocode empty
      if (!locationName) {
        const nm = w?.name;
        const cc = w?.sys?.country;
        if (nm) locationName = cc ? `${nm}, ${cc}` : nm;
      }
    }

    if (!locationName) locationName = "Unknown location";
    if (!weatherInfo) weatherInfo = "Weather unavailable";

    setLocationInfo({ lat, lng, name: locationName, weather: weatherInfo });
  };

  return (
    <div className="location-selector-container">
      <Globe3D onClick={handleGlobeClick} />
      {locationInfo && (
        <div className="location-info-box">
          <p>
            <strong>{locationInfo.name}</strong>
          </p>
          <p>{locationInfo.weather}</p>
          <p>
            Lat: {locationInfo.lat}, Lng: {locationInfo.lng}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
