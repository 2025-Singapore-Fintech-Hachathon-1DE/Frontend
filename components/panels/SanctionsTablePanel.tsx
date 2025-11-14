
import React, { useState, useMemo } from 'react';
import { SanctionCase } from '../../types';

interface SanctionsTablePanelProps {
  title: string;
  sanctions: SanctionCase[];
  onSelectSanction: (sanction: SanctionCase) => void;
}

const typeMapping: { [key: string]: string } = {
  IMMEDIATE_BOT: '봇 즉시 제재',
  NETWORK_REPEAT: '네트워크 반복',
  NETWORK_CHAIN: '네트워크 체인',
  CRITICAL: '펀딩비 악용 (Critical)',
  HIGH: '펀딩비 악용 (High)',
  COOPERATIVE_CRITICAL: '공모 거래 (Critical)',
};

const getBackgroundColor = (score: number) => {
    if (score >= 90) return 'bg-red-500/20 hover:bg-red-500/30';
    if (score >= 70) return 'bg-yellow-500/20 hover:bg-yellow-500/30';
    return 'bg-gray-500/20 hover:bg-gray-500/30';
}

export const SanctionsTablePanel: React.FC<SanctionsTablePanelProps> = ({ title, sanctions, onSelectSanction }) => {
  const [modelFilter, setModelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const sanctionTypes = useMemo(() => {
    const types = new Set(sanctions.map(s => s.type));
    return ['all', ...Array.from(types)];
  }, [sanctions]);

  const filteredSanctions = useMemo(() => {
    return sanctions.filter(s => {
        const modelMatch = modelFilter === 'all' || s.model === modelFilter;
        const typeMatch = typeFilter === 'all' || s.type === typeFilter;
        return modelMatch && typeMatch;
    });
  }, [sanctions, modelFilter, typeFilter]);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
            <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="p-1 bg-gray-700 border border-gray-600 rounded-md text-white text-xs focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="all">모든 모델</option>
                <option value="wash">자금세탁</option>
                <option value="funding">펀딩비</option>
                <option value="cooperative">공모</option>
            </select>
            <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-1 bg-gray-700 border border-gray-600 rounded-md text-white text-xs focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="all">모든 등급</option>
                {sanctionTypes.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{typeMapping[type] || type}</option>
                ))}
            </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3">시간</th>
              <th scope="col" className="px-4 py-3">계정 ID</th>
              <th scope="col" className="px-4 py-3">제재 유형</th>
              <th scope="col" className="px-4 py-3">점수</th>
              <th scope="col" className="px-4 py-3">상세</th>
            </tr>
          </thead>
          <tbody>
            {filteredSanctions.slice(0, 50).map((s) => (
              <tr 
                key={s.id} 
                className={`border-b border-gray-700 cursor-pointer transition-colors ${getBackgroundColor(s.score)}`}
                onClick={() => onSelectSanction(s)}
              >
                <td className="px-4 py-2 font-mono">{new Date(s.timestamp).toLocaleTimeString('ko-KR')}</td>
                <td className="px-4 py-2 font-mono truncate max-w-xs">{s.accounts.join(', ')}</td>
                <td className="px-4 py-2">{typeMapping[s.type] || s.type}</td>
                <td className="px-4 py-2 font-bold">{s.score.toFixed(1)}</td>
                <td className="px-4 py-2 truncate max-w-xs">{s.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
