// // File: pages/index.js

// import { useEffect, useState } from 'react';
// // import GeoMap from '../components/geomap';
// import dynamic from 'next/dynamic';

// const GeoMap = dynamic(() => import('../components/geomap'), { ssr: false });


// export default function HomePage() {
//   const [evData, setEvData] = useState([]);

//   useEffect(() => {
//     fetch('/data/county_ev_stats.json')
//       .then(res => res.json())
//       .then(data => setEvData(data));
//   }, []);

//   return (
//     <div>
//       <h1>Electric Vehicle Dashboard</h1>
//       <GeoMap data={evData} />
//     </div>
//   );
// }

// File: pages/index.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import BarChart from '../components/barchart';
import ScatterPlot from '../components/scatterplot';
import RangeSlider from '../components/rangeslider';

// 动态导入GeoMap以避免SSR问题
const GeoMap = dynamic(() => import('../components/geomap'), { ssr: false });

export default function HomePage() {
  const [geomapData, setGeomapData] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [countyBrands, setCountyBrands] = useState({});
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [rangeFilter, setRangeFilter] = useState([0, 200]); // Start with 200 miles range
  const [msrpFilter, setMsrpFilter] = useState([0, 50000]); // Start with $50,000 MSRP
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to fix JSON with NaN values
    const fetchAndFixJson = async (url) => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const validJson = text.replace(/NaN/g, 'null');
        return JSON.parse(validJson);
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return [];
      }
    };

    // 加载所有必要的数据
    Promise.all([
      fetchAndFixJson('/data/geomap_data.json'),
      fetchAndFixJson('/data/top_brands.json'),
      fetchAndFixJson('/data/car_models.json'),
      fetchAndFixJson('/data/county_brands.json')
    ])
    .then(([geoData, brands, cars, countyBrands]) => {
      setGeomapData(geoData);
      setTopBrands(brands);
      setCarModels(cars);
      setCountyBrands(countyBrands);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading data:', err);
      setLoading(false);
    });
  }, []);

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand === selectedBrand ? null : brand);
  };

  const handleCountyClick = (county) => {
    setSelectedCounty(county === selectedCounty ? null : county);
  };

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Electric Surge: An Interactive Visualization of EV Distribution, Types & Performance</h1>
      
      <div className="controls">
        <select 
          value={vehicleTypeFilter} 
          onChange={(e) => setVehicleTypeFilter(e.target.value)}
          className="ev-type-selector"
        >
          <option value="All">EV type</option>
          <option value="BEV">Battery Electric Vehicle (BEV)</option>
          <option value="PHEV">Plug-in Hybrid Electric Vehicle (PHEV)</option>
        </select>
      </div>
      
      <div className="main-content">
        <div className="left-panel">
          <h2>US Geomap by county</h2>
          <p>(color saturation: number of EV)</p>
          <GeoMap 
            data={geomapData} 
            selectedBrand={selectedBrand}
            vehicleTypeFilter={vehicleTypeFilter}
            onCountyClick={handleCountyClick}
          />
        </div>
        
        <div className="right-panel">
          <div className="bar-chart-container">
            <h2>Bar chart</h2>
            <p>Top 5 EV brands by total registrations</p>
            <p>(Clickable bars update the GeoMap to show only that brand's distribution)</p>
            <BarChart 
              topBrands={topBrands}
              countyBrands={countyBrands}
              selectedCounty={selectedCounty}
              onBrandClick={handleBrandClick} 
            />
          </div>
          
          <div className="scatter-plot-container">
            <h2>Scatter Plot</h2>
            <div className="filters">
              <div>
                <p>Electric range</p>
                <RangeSlider 
                  min={0} 
                  max={400} 
                  value={rangeFilter[1]} // Use the upper bound of the range
                  onChange={(value) => setRangeFilter([0, value])} 
                  label="Electric Range (miles)"
                />
              </div>
              <div>
                <p>MSRP</p>
                <RangeSlider 
                  min={0} 
                  max={100000} 
                  value={msrpFilter[1]} // Use the upper bound of the range
                  onChange={(value) => setMsrpFilter([0, value])} 
                  label="Base MSRP ($)"
                />
              </div>
            </div>
            <ScatterPlot 
              data={carModels} 
              selectedCounty={selectedCounty}
              rangeFilter={rangeFilter}
              msrpFilter={msrpFilter}
              vehicleTypeFilter={vehicleTypeFilter}
            />
            <div className="scatter-legend">
              <p>• Each dot = a unique model.</p>
              <p>• Tooltips show model name, brand, and type.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          text-align: left;
          margin-bottom: 20px;
        }
        
        .controls {
          margin-bottom: 20px;
        }
        
        .ev-type-selector {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: #f5f5f5;
        }
        
        .main-content {
          display: flex;
          gap: 20px;
        }
        
        .left-panel {
          flex: 1;
        }
        
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .bar-chart-container, .scatter-plot-container {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        
        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .scatter-legend {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}
