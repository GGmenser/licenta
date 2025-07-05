import React, { useState } from 'react';
import Globe3D from './Globe3D';
import './LocationSelector.css';
import axios from 'axios';

const LocationSelector = () => {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleGlobeClick = async ({ lat, lng }) => {
    try {
      const geoKey = import.meta.env.VITE_OPENCAGE_API_KEY;
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${geoKey}`
      );

      const location = response.data.results[0]?.formatted || 'Unknown location';

      setLocationInfo({ lat, lng, name: location });
    } catch (err) {
      console.error(err);
      setLocationInfo({ lat, lng, name: 'Error fetching location' });
    }
  };

 return (
  <div className="location-selector-container">
    <Globe3D onClick={handleGlobeClick} />
    {locationInfo && (
      <div className="location-info-box">
        <p><strong>Selected Location:</strong></p>
        <p>{locationInfo.name}</p>
      </div>
    )}
  </div>
);
};

export default LocationSelector;
