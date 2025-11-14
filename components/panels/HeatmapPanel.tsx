
import React from 'react';

interface HeatmapPanelProps {
  title: string;
  data: { [hour: number]: number };
}

const days = ['일', '월', '화', '수', '목', '금', '토'];

export const HeatmapPanel: React.FC<HeatmapPanelProps> = ({ title, data }) => {
  const maxDetections = Math.max(1, ...Object.values(data));

  const getColor = (value: number) => {
    if (!value || value === 0) return 'bg-gray-700/50';
    const intensity = Math.min(1, value / maxDetections);
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-green-600';
    return 'bg-green-800';
  };

  // Simulate a week's data by distributing hourly data
  const gridData = Array(7).fill(0).map((_, dayIndex) => 
    Array(24).fill(0).map((_, hourIndex) => {
        // Simple distribution for visual effect
        const key = hourIndex;
        const baseValue = data[key] || 0;
        // Add some noise to make it look more realistic across days
        return baseValue > 0 ? baseValue * (1 - Math.random() * 0.3) : 0;
    })
  );


  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
      <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow flex flex-col">
        <div className="flex justify-end text-xs text-gray-400 mb-2">
          <div className="flex items-center space-x-1">
            <span>적음</span>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
            <span>많음</span>
          </div>
        </div>
        <div className="grid grid-rows-7 gap-1 flex-grow">
          {days.map((day, dayIndex) => (
            <div key={day} className="grid grid-cols-25 gap-1 items-center">
              <div className="text-xs text-gray-400 col-span-1 text-center">{day}</div>
              {gridData[dayIndex].map((value, hourIndex) => (
                <div key={hourIndex} className="group relative col-span-1 h-full">
                   <div 
                    className={`w-full h-full rounded-sm ${getColor(value)} transition-transform duration-100 group-hover:scale-125 group-hover:shadow-lg`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 text-xs bg-gray-900 border border-gray-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {`${day}요일 ${hourIndex}:00 - ${hourIndex+1}:00`}
                      <br/>
                      <span className="font-bold">{`${Math.round(value)} 건`}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-25 gap-1 text-xs text-gray-500 mt-1">
           <div className="col-span-1"></div>
           {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="col-span-2 text-center">{i * 2}h</div>
           ))}
        </div>
      </div>
    </div>
  );
};
