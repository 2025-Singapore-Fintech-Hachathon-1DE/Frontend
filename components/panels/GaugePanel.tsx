
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GaugePanelProps {
  title: string;
  value: number; // 0 to 100
}

export const GaugePanel: React.FC<GaugePanelProps> = ({ title, value }) => {
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: 100 - value },
  ];
  const color = value > 80 ? '#ef4444' : value > 50 ? '#f59e0b' : '#3b82f6';
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col items-center justify-center border border-gray-700">
      <h3 className="text-md font-semibold text-white mb-2">{title}</h3>
      <div className="w-full h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              fill="#8884d8"
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
            >
              <Cell fill={color} />
              <Cell fill="#4B5563" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-1rem]">
          <span className="text-4xl font-bold" style={{color: color}}>{value.toFixed(1)}</span>
          <span className="text-lg text-gray-400">/100</span>
        </div>
      </div>
       <div className="flex justify-between w-full text-xs text-gray-400 px-4 mt-[-1rem]">
            <span>낮음</span>
            <span>중간</span>
            <span>높음</span>
        </div>
    </div>
  );
};
