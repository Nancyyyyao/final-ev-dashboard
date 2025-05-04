import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function BarChart({ topBrands, countyBrands, selectedCounty, onBrandClick }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    let chartData = [];
    
    if (selectedCounty && countyBrands && countyBrands[selectedCounty]) {
      // 如果选择了县，显示该县的前5大品牌
      chartData = countyBrands[selectedCounty].slice(0, 5);
    } else if (topBrands && topBrands.length > 0) {
      // 否则显示全州前5大品牌
      chartData = topBrands.slice(0, 5);
    } else {
      // 如果没有数据，显示默认数据
      chartData = [
        { brand: 'TESLA', count: 100 },
        { brand: 'NISSAN', count: 80 },
        { brand: 'CHEVROLET', count: 60 },
        { brand: 'FORD', count: 40 },
        { brand: 'BMW', count: 20 }
      ];
    }

    const labels = chartData.map(item => item.brand);
    const counts = chartData.map(item => item.count);

    // 销毁旧图表
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 创建新图表
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'EV Registrations',
          data: counts,
          backgroundColor: '#4ECDC4',
          borderColor: '#36A2EB',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: selectedCounty 
              ? `Top 5 EV Brands in ${selectedCounty} County` 
              : 'Top 5 EV Brands by Registrations'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Registrations: ${context.raw}`;
              }
            }
          }
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            onBrandClick(labels[index]);
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Registrations'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [topBrands, countyBrands, selectedCounty, onBrandClick]);

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
