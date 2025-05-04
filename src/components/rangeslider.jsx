import { useState, useEffect } from 'react';

export default function RangeSlider({ min, max, value, onChange, label }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  return (
    <div className="range-slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="range-slider"
      />
      <div className="range-value">
        {label ? `${label}: ` : ''}{localValue}
      </div>
      
      <style jsx>{`
        .range-slider-container {
          width: 100%;
          margin: 10px 0;
        }
        
        .range-slider {
          width: 100%;
          max-width: 300px;
          height: 8px;
          -webkit-appearance: none;
          background: #ddd;
          outline: none;
          border-radius: 4px;
        }
        
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #4ECDC4;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #4ECDC4;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .range-value {
          margin-top: 5px;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
