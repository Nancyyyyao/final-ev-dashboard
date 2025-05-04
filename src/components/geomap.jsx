import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GeoMap({ data, selectedBrand, onCountyClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    if (!L || !mapRef.current) return;

    // 初始化地图
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([47.7511, -120.7401], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    if (!data || data.length === 0) return;

    const filteredData = data.filter(item => {
      if (!item) return false;
      if (selectedBrand && item.Top_Brand !== selectedBrand) return false;
      return true;
    });

    fetch('/data/counties.geojson')
      .then(res => res.json())
      .then(geojson => {
        if (geoLayerRef.current) {
          mapInstanceRef.current.removeLayer(geoLayerRef.current);
        }

        geoLayerRef.current = L.geoJSON(geojson, {
          style: feature => {
            const name = feature.properties.NAME;
            const match = filteredData.find(item => item.County === name);

            if (!match) {
              return {
                fillColor: '#d9d9d9',
                weight: 0.5,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.3
              };
            }

            return {
              fillColor: getColor(match.EV_Count),
              weight: 0.5,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.7
            };
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties.NAME;
            const match = filteredData.find(item => item.County === name);

            if (match) {
              layer.bindTooltip(`
                <strong>${name} County</strong><br>
                EVs: ${match.EV_Count}<br>
                Avg Range: ${match.Avg_Range.toFixed(1)} mi<br>
                Avg MSRP: $${match.Avg_MSRP.toLocaleString()}<br>
                Top Brand: ${match.Top_Brand}`, 
                { sticky: true }
              );
              layer.on('click', function() {
                if (onCountyClick) {
                  onCountyClick(name);
                }
              });
            } else {
              layer.bindTooltip(`
                <strong>${name} County</strong><br>
                No data available`, 
                { sticky: true }
              );
            }
          }
        }).addTo(mapInstanceRef.current);

        if (!legendRef.current) {
          legendRef.current = createLegendControl();
          legendRef.current.addTo(mapInstanceRef.current);
        }
      })
      .catch(err => console.error('GeoJSON loading failed:', err));

    return () => {
      if (mapInstanceRef.current && geoLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoLayerRef.current);
      }
    };
  }, [data, selectedBrand, onCountyClick]);

  function createLegendControl() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 50, 100, 500, 1000, 2500, 5000];
      const labels = [];

      div.innerHTML = '<strong>EV Count</strong><br>';

      for (let i = 0; i < grades.length - 1; i++) {
        const from = grades[i];
        const to = grades[i + 1];

        labels.push(
          `<i style="background:${getColor(from + 1)}; width:18px; height:18px; float:left; margin-right:8px; opacity:0.7;"></i> ${from}${to ? '–' + to : '+'}`
        );
      }

      div.innerHTML += labels.join('<br>');
      div.style.background = 'white';
      div.style.padding = '8px';
      div.style.fontSize = '12px';
      div.style.lineHeight = '18px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
      div.style.borderRadius = '4px';

      return div;
    };

    return legend;
  }

  function getColor(count) {
    return count > 5000 ? '#084594' :
           count > 2500 ? '#2171b5' :
           count > 1000 ? '#4292c6' :
           count > 500 ? '#6baed6' :
           count > 100 ? '#9ecae1' :
           count > 50 ? '#c6dbef' : '#eff3ff';
  }

  return (
    <div className="map-container" ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
  );
}
