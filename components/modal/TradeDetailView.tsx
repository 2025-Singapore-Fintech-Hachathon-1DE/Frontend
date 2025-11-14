
import React from 'react';
import { Trade } from '../../types';

interface TradeDetailViewProps {
  trade: Trade;
  allTrades: Trade[];
  onBack: () => void;
}

const Stat: React.FC<{ label: string; value: string | number | undefined; className?: string }> = ({ label, value, className }) => (
    <div className={`bg-gray-700/50 p-3 rounded-md ${className}`}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-md font-bold text-white truncate">{String(value) || 'N/A'}</p>
    </div>
);


export const TradeDetailView: React.FC<TradeDetailViewProps> = ({ trade, allTrades, onBack }) => {
  const relatedTrades = allTrades.filter(
    t => t.position_id === trade.position_id && t.trade_id !== trade.trade_id
  ).sort((a,b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <div>
            <h3 className="text-lg font-semibold text-white">거래 상세 정보</h3>
            <p className="text-sm text-gray-400 font-mono">{trade.trade_id}</p>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-300 mb-2">거래 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="계정 ID" value={trade.account_id} className="md:col-span-2"/>
            <Stat label="심볼" value={trade.symbol} className="md:col-span-2"/>
            <Stat label="시간" value={new Date(trade.timestamp).toLocaleString('ko-KR')} />
            <Stat label="사이드" value={trade.side} />
            <Stat label="레버리지" value={`${trade.leverage}x`} />
            <Stat label="포지션 ID" value={trade.position_id} />
            <Stat label="가격" value={`$${trade.price.toLocaleString()}`} />
            <Stat label="수량" value={trade.quantity.toLocaleString()} />
            <Stat label="총액" value={`$${trade.amount.toLocaleString()}`} />
        </div>
      </div>
      
       <div>
        <h4 className="text-md font-semibold text-gray-300 mb-2">연관 거래 (동일 포지션)</h4>
        {relatedTrades.length > 0 ? (
          <div className="max-h-60 overflow-y-auto">
             <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                    <tr>
                    <th scope="col" className="px-4 py-2">시간</th>
                    <th scope="col" className="px-4 py-2">가격</th>
                    <th scope="col" className="px-4 py-2">수량</th>
                    <th scope="col" className="px-4 py-2">총액</th>
                    </tr>
                </thead>
                <tbody>
                    {relatedTrades.map((t) => (
                    <tr key={t.trade_id} className="border-b border-gray-700">
                        <td className="px-4 py-2 font-mono">{new Date(t.timestamp).toLocaleTimeString('ko-KR')}</td>
                        <td className="px-4 py-2">${t.price.toFixed(4)}</td>
                        <td className="px-4 py-2">{t.quantity.toLocaleString()}</td>
                        <td className="px-4 py-2">${t.amount.toLocaleString()}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-900/50 p-4 rounded-md text-center">이 포지션에 대한 다른 거래 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
};
