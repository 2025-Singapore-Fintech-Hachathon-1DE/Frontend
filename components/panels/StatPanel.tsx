
import React from 'react';

interface StatPanelProps {
  title: string;
  value: string;
}

export const StatPanel: React.FC<StatPanelProps> = ({ title, value }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
};
