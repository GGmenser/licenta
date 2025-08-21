import React, { useState } from 'react';
import Globe3D from './Globe3D';
import './LocationSelector.css';
import axios from 'axios';

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleGlobeClick = async ({ lat, lng }) => {
    try {
      // Fetch location name and weather based on latitude and longitude
      const locationResponse = await axios.get('/api/geocode-proxy', {
      params: { query: `${lat}+${lng}` }
    });


       const components = locationResponse.data.results[0]?.components || {};
    const city = components.city || components.town || components.village || components.county || '';
    const country = components.country || 'Unknown country';
    var locationName;
    if(city == '')  {locationName = `${country}`} else{locationName = `${city}, ${country}`};

const weatherResponse = await axios.get('/api/weather-proxy', {
  params: { lat, lon: lng }
});

const weather = weatherResponse.data.weather[0].description;
    const temp = weatherResponse.data.main.temp;

    const weatherInfo = `${weather}, ${temp}°C`;

  

    

      setLocationInfo({ lat, lng, name: locationName, weather: weatherInfo });
    } catch (err) {
      console.error(err);
      setLocationInfo({ lat, lng, name: 'Error fetching location & weather' });
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
