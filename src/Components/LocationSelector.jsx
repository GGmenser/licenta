import React, { useState } from 'react';
import Globe3D from './Globe3D';
import './LocationSelector.css';
import axios from 'axios';

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleGlobeClick = async ({ lat, lng }) => {
    try {
      // 1) Reverse geocoding prin proxy (NU mai folosim cheia în frontend)
      const geoRes = await axios.get('/api/geocode-proxy', {
        params: { query: `${lat}+${lng}` }
      });

      const components = geoRes.data?.results?.[0]?.components || {};
      const city =
        components.city ||
        components.town ||
        components.village ||
        components.county ||
        '';
      const country = components.country || 'Unknown country';

      // Numele afișat
      const locationName = city ? `${city}, ${country}` : `${country}`;

      // 2) Weather prin proxy
      // Varianta bazată pe oraș (conform proxy-ului nostru care așteaptă ?city=)
      const cityForWeather = city || country;
      const weatherRes = await axios.get('/api/weather-proxy', {
        params: { city: cityForWeather }
      });

      // Normalizează un pic răspunsul (OpenWeather standard)
      const weatherDesc = weatherRes.data?.weather?.[0]?.description ?? 'N/A';
      const temp = weatherRes.data?.main?.temp ?? 'N/A';
      const weatherInfo = `${weatherDesc}, ${temp}°C`;

      setLocationInfo({ lat, lng, name: locationName, weather: weatherInfo });
    } catch (err) {
      console.error(err);
      setLocationInfo({
        lat,
        lng,
        name: 'Error fetching location & weather',
        weather: null
      });
    }
  };

  return (
    <div className="location-selector-container">
      <Globe3D onClick={handleGlobeClick} />
      {locationInfo && (
        <div className="location-info-box">
          <p><strong>Selected Location:</strong> {locationInfo.name}</p>
          {locationInfo.weather && (
            <p><strong>Weather:</strong> {locationInfo.weather}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
