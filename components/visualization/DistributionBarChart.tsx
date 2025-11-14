
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DistributionBarChartProps {
  title: string;
  data: { name: string; value: number }[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md text-sm">
        <p className="label text-gray-300">{`${label} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export const DistributionBarChart: React.FC<DistributionBarChartProps> = ({ title, data }) => {
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg h-64 flex flex-col">
      <h4 className="text-md font-semibold text-white mb-4">{title}</h4>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
            <YAxis stroke="#9CA3AF" fontSize={10} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
