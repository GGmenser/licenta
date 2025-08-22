import React, { useState } from 'react';
import Globe3D from './Globe3D';
import './LocationSelector.css';
import axios from 'axios';

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleGlobeClick = async ({ lat, lng }) => {
    let locationName = '';
    let weatherInfo = '';
    let geocodeData = null;
    let weatherData = null;

    try {
      // 1) GEOCODE (OpenCage via Azure Function)
      const geocodeRes = await axios.get('/api/geocode', { params: { lat, lng } });
      geocodeData = geocodeRes.data;
      console.log('GEOCODE RAW:', geocodeData);

      const comp = geocodeData?.results?.[0]?.components || {};
      const city =
        comp.city ||
        comp.town ||
        comp.village ||
        comp.hamlet ||
        comp.suburb ||
        comp.county ||
        comp.state ||
        '';

      const country = comp.country || '';
      if (city || country) {
        locationName = city ? `${city}${country ? ', ' + country : ''}` : country;
      }
    } catch (e) {
      console.error('GEOCODE ERR:', e?.response?.status, e?.response?.data || e.message);
    }

    try {
      // 2) WEATHER (OpenWeather via Azure Function)
      const weatherRes = await axios.get('/api/weather', { params: { lat, lng } }); 
      weatherData = weatherRes.data;
      console.log('WEATHER RAW:', weatherData);

      const desc = weatherData?.weather?.[0]?.description;
      const temp = weatherData?.main?.temp;
      if (desc != null && temp != null) {
        weatherInfo = `${desc}, ${Math.round(temp)}°C`;
      }

      // Fallback pentru nume dacă geocoding nu a dat ceva util
      if (!locationName) {
        const owName = weatherData?.name;
        const owCountry = weatherData?.sys?.country;
        if (owName) {
          locationName = owCountry ? `${owName}, ${owCountry}` : owName;
        }
      }
    } catch (e) {
      console.error('WEATHER ERR:', e?.response?.status, e?.response?.data || e.message);
    }

    // 3) Ultimele fallback-uri pentru UI
    if (!locationName) locationName = 'Unknown location'; 
    if (!weatherInfo) weatherInfo = 'Weather unavailable';

    setLocationInfo({ lat, lng, name: locationName, weather: weatherInfo });
  };

  return (
    <div className="location-selector-container">
      <Globe3D onClick={handleGlobeClick} />
      {locationInfo && (
        <div className="location-info-box">
          <p><strong>{locationInfo.name}</strong></p>
          <p>{locationInfo.weather}</p>
          <p>Lat: {locationInfo.lat}, Lng: {locationInfo.lng}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
