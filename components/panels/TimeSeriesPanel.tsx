
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { DetectionType } from '../../types';

type TimeSeriesData = { time: number; [DetectionType.WashTrading]: number; [DetectionType.FundingFee]: number; [DetectionType.Cooperative]: number };
type Unit = 'hour' | 'day' | 'week' | 'month';

interface TimeSeriesPanelProps {
  title: string;
  data: TimeSeriesData[];
}

const seriesConfig = [
  { name: '자금세탁', dataKey: DetectionType.WashTrading, color: '#3b82f6' },
  { name: '펀딩비 악용', dataKey: DetectionType.FundingFee, color: '#10b981' },
  { name: '공모 거래', dataKey: DetectionType.Cooperative, color: '#f59e0b' },
];

const CustomTooltip: React.FC<any> = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const formatters: Record<Unit, (date: Date) => string> = {
        hour: (date) => date.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}),
        day: (date) => date.toLocaleDateString('ko-KR'),
        week: (date) => `${date.toLocaleDateString('ko-KR')} 주간`,
        month: (date) => date.toLocaleString('ko-KR', { year: 'numeric', month: 'long' }),
    };
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md text-sm">
        <p className="label text-gray-300">{formatters[unit](new Date(label))}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString()} 건`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const aggregateData = (data: TimeSeriesData[], unit: Unit): TimeSeriesData[] => {
    if (!data.length) return [];
    
    const aggregated: { [key: number]: TimeSeriesData } = {};

    data.forEach(item => {
        const date = new Date(item.time);
        let key: number;

        if (unit === 'day') {
            key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        } else if (unit === 'week') {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
            key = new Date(date.setDate(diff)).setHours(0,0,0,0);
        } else if (unit === 'month') {
            key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        } else { // hour
             key = item.time;
        }

        if (!aggregated[key]) {
            aggregated[key] = {
                time: key,
                [DetectionType.WashTrading]: 0,
                [DetectionType.FundingFee]: 0,
                [DetectionType.Cooperative]: 0,
            };
        }
        aggregated[key][DetectionType.WashTrading] += item[DetectionType.WashTrading];
        aggregated[key][DetectionType.FundingFee] += item[DetectionType.FundingFee];
        aggregated[key][DetectionType.Cooperative] += item[DetectionType.Cooperative];
    });

    return Object.values(aggregated).sort((a, b) => a.time - b.time);
};

export const TimeSeriesPanel: React.FC<TimeSeriesPanelProps> = ({ title, data }) => {
  const [visibleSeries, setVisibleSeries] = useState<{[key: string]: boolean}>(
    seriesConfig.reduce((acc, { dataKey }) => ({ ...acc, [dataKey]: true }), {})
  );

  const [unit, setUnit] = useState<Unit>('day');

  const processedData = useMemo(() => aggregateData(data, unit), [data, unit]);

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setVisibleSeries(prev => ({...prev, [dataKey]: !prev[dataKey]}));
  };

   const tickFormatters: Record<Unit, (time: number) => string> = {
        hour: (time) => new Date(time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        day: (time) => new Date(time).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        week: (time) => new Date(time).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        month: (time) => new Date(time).toLocaleString('ko-KR', { month: 'short' }),
    };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-white">{title}</h3>
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-md">
                {(['hour', 'day', 'week', 'month'] as Unit[]).map(u => (
                    <button 
                        key={u} 
                        onClick={() => setUnit(u)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${unit === u ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
                    >
                        {u === 'hour' && '시간'}
                        {u === 'day' && '일'}
                        {u === 'week' && '주'}
                        {u === 'month' && '월'}
                    </button>
                ))}
            </div>
        </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis 
              dataKey="time" 
              tickFormatter={tickFormatters[unit]}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend wrapperStyle={{fontSize: "12px", cursor: 'pointer'}} onClick={handleLegendClick} />
            {seriesConfig.map(s => (
                visibleSeries[s.dataKey] && <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.2} strokeWidth={2} />
            ))}
             <Brush dataKey="time" height={20} stroke="#3b82f6" fill="rgba(128,128,128,0.1)" tickFormatter={tickFormatters[unit]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
