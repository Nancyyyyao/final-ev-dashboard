// import { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// export default function GeoMap() {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const legendRef = useRef(null); // ⬅️ 图例状态
//   const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');

//   useEffect(() => {
//     if (!L) return;

//     if (!mapInstanceRef.current && mapRef.current) {
//       mapInstanceRef.current = L.map(mapRef.current).setView([47.5, -120.5], 7);
//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors'
//       }).addTo(mapInstanceRef.current);
//     }

//     let geoLayer;

//     Promise.all([
//       fetch('/data/counties.geojson').then(res => res.json()),
//       fetch('/data/county_ev_stats.json').then(res => res.json())
//     ])
//       .then(([geojson, stats]) => {
//         const statsMap = {};
//         stats.forEach(item => {
//           if (!item || !item.County) return;
//           if (vehicleTypeFilter === 'All' || item.Electric_Vehicle_Type?.includes(vehicleTypeFilter)) {
//             statsMap[item.County.toLowerCase()] = item;
//           }
//         });

//         function getColor(count) {
//           return count > 1000 ? '#084594' :
//                  count > 500  ? '#2171b5' :
//                  count > 200  ? '#4292c6' :
//                  count > 100  ? '#6baed6' :
//                  count > 50   ? '#9ecae1' :
//                  count > 10   ? '#c6dbef' : '#eff3ff';
//         }

//         function style(feature) {
//           const name = feature.properties.NAME?.toLowerCase();
//           const match = statsMap[name];
//           if (!match) {
//             return {
//               fillColor: '#d9d9d9',
//               weight: 0.5,
//               opacity: 1,
//               color: 'white',
//               fillOpacity: 0.3
//             };
//           }

//           const count = match.EV_Count;
//           return {
//             fillColor: getColor(count),
//             weight: 0.5,
//             opacity: 1,
//             color: 'white',
//             fillOpacity: 0.7
//           };
//         }

//         function onEachFeature(feature, layer) {
//           const name = feature.properties.NAME;
//           const match = statsMap[name?.toLowerCase()];
        
//           if (match) {
//             layer.bindTooltip(
//               `<strong>${name} County</strong><br/>
//               EVs: ${match.EV_Count}<br/>
//               Avg Range: ${match.Avg_Range ? match.Avg_Range.toFixed(1) : "N/A"} mi<br/>
//               Top Brand: ${match.Top_Brand}`,
//               { sticky: true }
//             );
//           } else {
//             layer.bindTooltip(
//               `<strong>${name} County</strong><br/>
//               <span style="color: gray;">No data available</span>`,
//               { sticky: true }
//             );
//           }
//         }
        

//         if (mapInstanceRef.current) {
//           if (geoLayer) {
//             mapInstanceRef.current.removeLayer(geoLayer);
//           }

//           geoLayer = L.geoJSON(geojson, { style, onEachFeature }).addTo(mapInstanceRef.current);

//           if (!legendRef.current) {
//             legendRef.current = createLegendControl();
//             legendRef.current.addTo(mapInstanceRef.current);
//           }
//         }
//       })
//       .catch(err => console.error('Data loading failed:', err));

//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.remove();
//         mapInstanceRef.current = null;
//       }
//     };
//   }, [vehicleTypeFilter]);

//   function createLegendControl() {
//     const legend = L.control({ position: 'bottomright' });
//     legend.onAdd = function (map) {
//       const div = L.DomUtil.create('div', 'info legend');
//       const grades = [null, 1, 50, 100, 200, 500, 1000]; // null 表示缺失
//       const labels = [];
  
//       for (let i = 0; i < grades.length; i++) {
//         const from = grades[i];
//         const to = grades[i + 1];
  
//         if (from === null) {
//           labels.push(
//             `<i style="background:#d9d9d9; width: 18px; height: 18px; display:inline-block; margin-right:8px;"></i> 
//             0 (Missing)`
//           );
//         } else {
//           labels.push(
//             `<i style="background:${getColor(from)}; width: 18px; height: 18px; display:inline-block; margin-right:8px;"></i> 
//             ${from}${to ? '&ndash;' + to : '+'}`
//           );
//         }
//       }
  
//       div.innerHTML = `<strong>EV Count</strong><br/>` + labels.join('<br/>');
//       div.style.background = 'white';
//       div.style.padding = '8px';
//       div.style.fontSize = '12px';
//       div.style.lineHeight = '18px';
//       div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
//       return div;
//     };
//     return legend;
//   }
  

//   function getColor(count) {
//     return count > 1000 ? '#084594' :
//            count > 500  ? '#2171b5' :
//            count > 200  ? '#4292c6' :
//            count > 100  ? '#6baed6' :
//            count > 50   ? '#9ecae1' :
//            count > 10   ? '#c6dbef' : '#eff3ff';
//   }

//   return (
//     <>
//       <div style={{ margin: '1rem' }}>
//         <label htmlFor="filter">Filter by EV Type: </label>
//         <select
//           id="filter"
//           value={vehicleTypeFilter}
//           onChange={e => setVehicleTypeFilter(e.target.value)}
//         >
//           <option value="All">All</option>
//           <option value="Battery Electric Vehicle (BEV)">BEV</option>
//           <option value="Plug-in Hybrid Electric Vehicle (PHEV)">PHEV</option>
//           <option value="Hybrid Electric Vehicle (HEV)">HEV</option>
//         </select>
//       </div>
//       <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
//     </>
//   );
// }


import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GeoMap({ data, selectedBrand, vehicleTypeFilter, onCountyClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    if (!L || !mapRef.current) return;

    // 初始化地图
    if (!mapInstanceRef.current) {
      // 设置视图为华盛顿州中心
      mapInstanceRef.current = L.map(mapRef.current).setView([47.7511, -120.7401], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // 只有在有数据时继续
    if (!data || data.length === 0) return;

    // 处理数据
    const filteredData = data.filter(item => {
      if (!item) return false;
      
      // 根据选择的品牌过滤
      if (selectedBrand && item.Top_Brand !== selectedBrand) return false;
      
      // 更灵活的车辆类型过滤
      if (vehicleTypeFilter !== 'All') {
        const itemType = item.Electric_Vehicle_Type || '';
        // 检查项目类型是否包含过滤器文本（不区分大小写）
        if (!itemType.toLowerCase().includes(vehicleTypeFilter.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });

    // 加载GeoJSON数据
    fetch('/data/counties.geojson')
      .then(res => res.json())
      .then(geojson => {
        // 移除现有图层
        if (geoLayerRef.current) {
          mapInstanceRef.current.removeLayer(geoLayerRef.current);
        }
        
        // 创建新图层
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
              
              // 添加点击处理程序
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

        // 添加图例
        if (!legendRef.current) {
          legendRef.current = createLegendControl();
          legendRef.current.addTo(mapInstanceRef.current);
        }
      })
      .catch(err => console.error('GeoJSON loading failed:', err));

    return () => {
      // 清理函数
      if (mapInstanceRef.current) {
        if (geoLayerRef.current) {
          mapInstanceRef.current.removeLayer(geoLayerRef.current);
        }
      }
    };
  }, [data, selectedBrand, vehicleTypeFilter, onCountyClick]);

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


