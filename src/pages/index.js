// File: pages/index.js

import { useEffect, useState } from 'react';
// import GeoMap from '../components/geomap';
import dynamic from 'next/dynamic';

const GeoMap = dynamic(() => import('../components/geomap'), { ssr: false });


export default function HomePage() {
  const [evData, setEvData] = useState([]);

  useEffect(() => {
    fetch('/data/county_ev_stats.json')
      .then(res => res.json())
      .then(data => setEvData(data));
  }, []);

  return (
    <div>
      <h1>Electric Vehicle Dashboard</h1>
      <GeoMap data={evData} />
    </div>
  );
}
