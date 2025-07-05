import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';

const Globe3D = ({ onClick }) => {
  const globeEl = useRef();
  const [bordersData, setBordersData] = useState([]);

  useEffect(() => {
    // Load GeoJSON country borders
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(data => setBordersData(data.features));
  }, []);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundColor="rgba(0, 0, 0, 0)"
      onGlobeClick={onClick}
      polygonsData={bordersData}
      polygonStrokeColor={() => 'rgba(255, 255, 255, 0.1)'}
      polygonAltitude={0.0000000000000000001}
      polygonCapColor={() => 'rgba(255, 255, 255, 0)'} // transparent fill
    />
  );
};

export default Globe3D;
