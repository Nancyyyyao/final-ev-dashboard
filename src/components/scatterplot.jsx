import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ScatterPlot({ data, selectedCounty, rangeFilter, msrpFilter, vehicleTypeFilter }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    if (!data || data.length === 0) {
      // 如果没有数据，显示默认数据
      createChart([
        { x: 30000, y: 150, model: "Sample EV 1", brand: "TESLA", type: "BEV" },
        { x: 40000, y: 200, model: "Sample EV 2", brand: "NISSAN", type: "BEV" },
        { x: 20000, y: 100, model: "Sample EV 3", brand: "CHEVROLET", type: "PHEV" }
      ]);
      return;
    }

    // 确保rangeFilter和msrpFilter是包含两个值的数组
    const rangeMin = Array.isArray(rangeFilter) ? rangeFilter[0] : 0;
    const rangeMax = Array.isArray(rangeFilter) ? rangeFilter[1] : rangeFilter || 400;
    const msrpMin = Array.isArray(msrpFilter) ? msrpFilter[0] : 0;
    const msrpMax = Array.isArray(msrpFilter) ? msrpFilter[1] : msrpFilter || 100000;

    // 过滤数据
    const filteredData = data.filter(item => {
      const range = parseFloat(item.Electric_Range || 0);
      const msrp = parseFloat(item.Base_MSRP || 0);
      const type = item.Electric_Vehicle_Type || '';
      
      // 更灵活的车辆类型过滤
      const typeMatches = vehicleTypeFilter === 'All' || 
                          type.toLowerCase().includes(vehicleTypeFilter.toLowerCase());
      
      return (
        (selectedCounty ? item.County === selectedCounty : true) &&
        range >= rangeMin && 
        range <= rangeMax && 
        msrp >= msrpMin && 
        msrp <= msrpMax &&
        typeMatches
      );
    });

    // 准备散点图数据
    const scatterData = filteredData.map(item => ({
      x: parseFloat(item.Base_MSRP || 0),
      y: parseFloat(item.Electric_Range || 0),
      model: item.Model || 'Unknown Model',
      brand: item.Make || 'Unknown Brand',
      type: item.Electric_Vehicle_Type || 'Unknown Type'
    }));
    
    createChart(scatterData);
    
  }, [data, selectedCounty, rangeFilter, msrpFilter, vehicleTypeFilter]);

  function createChart(chartData) {
    // 销毁旧图表
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 创建新图表
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'EV Models',
          data: chartData,
          backgroundColor: '#4ECDC4',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: selectedCounty 
              ? `EV Models in ${selectedCounty} County` 
              : 'EV Range vs MSRP'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw;
                return [
                  `Model: ${point.model}`,
                  `Brand: ${point.brand}`,
                  `Type: ${point.type}`,
                  `Range: ${point.y} miles`,
                  `MSRP: $${point.x.toLocaleString()}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Base MSRP ($)'
            },
            ticks: {
              callback: value => `$${value.toLocaleString()}`
            }
          },
          y: {
            title: {
              display: true,
              text: 'Electric Range (miles)'
            }
          }
        }
      }
    });
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
