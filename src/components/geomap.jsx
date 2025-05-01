import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GeoMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const legendRef = useRef(null); // ⬅️ 图例状态
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');

  useEffect(() => {
    if (!L) return;

    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([47.5, -120.5], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    let geoLayer;

    Promise.all([
      fetch('/data/counties.geojson').then(res => res.json()),
      fetch('/data/county_ev_stats.json').then(res => res.json())
    ])
      .then(([geojson, stats]) => {
        const statsMap = {};
        stats.forEach(item => {
          if (!item || !item.County) return;
          if (vehicleTypeFilter === 'All' || item.Electric_Vehicle_Type?.includes(vehicleTypeFilter)) {
            statsMap[item.County.toLowerCase()] = item;
          }
        });

        function getColor(count) {
          return count > 1000 ? '#084594' :
                 count > 500  ? '#2171b5' :
                 count > 200  ? '#4292c6' :
                 count > 100  ? '#6baed6' :
                 count > 50   ? '#9ecae1' :
                 count > 10   ? '#c6dbef' : '#eff3ff';
        }

        function style(feature) {
          const name = feature.properties.NAME?.toLowerCase();
          const match = statsMap[name];
          if (!match) {
            return {
              fillColor: '#d9d9d9',
              weight: 0.5,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.3
            };
          }

          const count = match.EV_Count;
          return {
            fillColor: getColor(count),
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          };
        }

        function onEachFeature(feature, layer) {
          const name = feature.properties.NAME;
          const match = statsMap[name?.toLowerCase()];
        
          if (match) {
            layer.bindTooltip(
              `<strong>${name} County</strong><br/>
              EVs: ${match.EV_Count}<br/>
              Avg Range: ${match.Avg_Range ? match.Avg_Range.toFixed(1) : "N/A"} mi<br/>
              Top Brand: ${match.Top_Brand}`,
              { sticky: true }
            );
          } else {
            layer.bindTooltip(
              `<strong>${name} County</strong><br/>
              <span style="color: gray;">No data available</span>`,
              { sticky: true }
            );
          }
        }
        

        if (mapInstanceRef.current) {
          if (geoLayer) {
            mapInstanceRef.current.removeLayer(geoLayer);
          }

          geoLayer = L.geoJSON(geojson, { style, onEachFeature }).addTo(mapInstanceRef.current);

          if (!legendRef.current) {
            legendRef.current = createLegendControl();
            legendRef.current.addTo(mapInstanceRef.current);
          }
        }
      })
      .catch(err => console.error('Data loading failed:', err));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vehicleTypeFilter]);

  function createLegendControl() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [null, 1, 50, 100, 200, 500, 1000]; // null 表示缺失
      const labels = [];
  
      for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];
  
        if (from === null) {
          labels.push(
            `<i style="background:#d9d9d9; width: 18px; height: 18px; display:inline-block; margin-right:8px;"></i> 
            0 (Missing)`
          );
        } else {
          labels.push(
            `<i style="background:${getColor(from)}; width: 18px; height: 18px; display:inline-block; margin-right:8px;"></i> 
            ${from}${to ? '&ndash;' + to : '+'}`
          );
        }
      }
  
      div.innerHTML = `<strong>EV Count</strong><br/>` + labels.join('<br/>');
      div.style.background = 'white';
      div.style.padding = '8px';
      div.style.fontSize = '12px';
      div.style.lineHeight = '18px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
      return div;
    };
    return legend;
  }
  

  function getColor(count) {
    return count > 1000 ? '#084594' :
           count > 500  ? '#2171b5' :
           count > 200  ? '#4292c6' :
           count > 100  ? '#6baed6' :
           count > 50   ? '#9ecae1' :
           count > 10   ? '#c6dbef' : '#eff3ff';
  }

  return (
    <>
      <div style={{ margin: '1rem' }}>
        <label htmlFor="filter">Filter by EV Type: </label>
        <select
          id="filter"
          value={vehicleTypeFilter}
          onChange={e => setVehicleTypeFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Battery Electric Vehicle (BEV)">BEV</option>
          <option value="Plug-in Hybrid Electric Vehicle (PHEV)">PHEV</option>
          <option value="Hybrid Electric Vehicle (HEV)">HEV</option>
        </select>
      </div>
      <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
    </>
  );
}
