
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../Icons';

interface RelatedTradesTableProps {
  trades: any[];
  model: 'wash' | 'cooperative';
}

export const RelatedTradesTable: React.FC<RelatedTradesTableProps> = ({ trades, model }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    if (trades.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-4">연관된 거래 내역이 없습니다.</p>;
    }

    const renderWashTradeRow = (trade: any) => (
        <React.Fragment key={trade.pair_id}>
            <tr className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer" onClick={() => toggleRow(trade.pair_id)}>
                <td className="p-2 text-xs font-mono">{trade.pair_id}</td>
                <td className="p-2 text-xs font-mono truncate">{trade.winner_account}</td>
                <td className="p-2 text-xs font-mono">${(trade.laundered_amount || 0).toFixed(2)}</td>
                <td className="p-2 text-xs">{trade.total_score.toFixed(1)}</td>
                <td className="p-2">
                    {expandedRow === trade.pair_id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </td>
            </tr>
            {expandedRow === trade.pair_id && (
                <tr className="bg-gray-900/50">
                    <td colSpan={5} className="p-3">
                        <div className="text-xs text-gray-400 grid grid-cols-2 gap-2">
                            <div>PNL 미러링: {trade.score_pnl_mirroring}</div>
                            <div>동시성: {trade.score_concurrency}</div>
                            <div>수량 일치: {trade.score_quantity}</div>
                            <div>가치 비율: {trade.score_trade_ratio}</div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    const renderCoopTradeRow = (trade: any) => (
         <React.Fragment key={trade.pair_id}>
            <tr className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer" onClick={() => toggleRow(trade.pair_id)}>
                <td className="p-2 text-xs font-mono">{trade.pair_id}</td>
                <td className="p-2 text-xs font-mono">{trade.risk_level}</td>
                <td className="p-2 text-xs">{trade.total_score.toFixed(1)}</td>
                <td className="p-2">
                    {expandedRow === trade.pair_id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </td>
            </tr>
            {expandedRow === trade.pair_id && (
                <tr className="bg-gray-900/50">
                    <td colSpan={4} className="p-3">
                        <div className="text-xs text-gray-400 grid grid-cols-2 gap-2">
                            <div>PNL 비대칭: {trade.score_pnl_asymmetry}</div>
                            <div>시간 근접성: {trade.score_time_proximity}</div>
                            <div>IP 공유: {trade.score_ip_sharing}</div>
                            <div>포지션 중첩: {trade.score_position_overlap}</div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    const washHeaders = ["Pair ID", "수익 계정", "금액", "점수", ""];
    const coopHeaders = ["Pair ID", "위험도", "점수", ""];

    const headers = model === 'wash' ? washHeaders : coopHeaders;

    return (
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                <tr>
                    {headers.map(h => <th key={h} scope="col" className="p-2">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {trades.map(trade => model === 'wash' ? renderWashTradeRow(trade) : renderCoopTradeRow(trade))}
            </tbody>
        </table>
    );
};
