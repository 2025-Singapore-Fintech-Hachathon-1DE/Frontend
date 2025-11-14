import React, { useState } from 'react'
import { Trade } from '../../types'

interface TradeHistoryTableProps {
    trades: Trade[]
    onSelectTrade: (trade: Trade) => void
}

const ROWS_PER_PAGE = 10

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ trades, onSelectTrade }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(trades.length / ROWS_PER_PAGE)

    const paginatedTrades = trades.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(totalPages, page)))
    }

    if (trades.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">이 계정의 거래 내역이 없습니다.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-3">
                                시간
                            </th>
                            <th scope="col" className="px-4 py-3">
                                심볼
                            </th>
                            <th scope="col" className="px-4 py-3">
                                사이드
                            </th>
                            <th scope="col" className="px-4 py-3">
                                가격
                            </th>
                            <th scope="col" className="px-4 py-3">
                                수량
                            </th>
                            <th scope="col" className="px-4 py-3">
                                총액
                            </th>
                            <th scope="col" className="px-4 py-3">
                                레버리지
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTrades.map((trade) => {
                            // 안전한 데이터 표시
                            const timestamp = trade.timestamp || Date.now()
                            const price = Number(trade.price) || 0
                            const quantity = Number(trade.quantity) || 0
                            const amount = Number(trade.amount) || 0
                            const leverage = Number(trade.leverage) || 1

                            return (
                                <tr
                                    key={trade.trade_id}
                                    className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                                    onClick={() => onSelectTrade(trade)}
                                >
                                    <td className="px-4 py-2 font-mono text-xs">{new Date(timestamp).toLocaleString('ko-KR')}</td>
                                    <td className="px-4 py-2 font-mono">{trade.symbol || 'N/A'}</td>
                                    <td className={`px-4 py-2 font-bold ${trade.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                                        {trade.side || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2">${price.toFixed(4)}</td>
                                    <td className="px-4 py-2">{quantity.toLocaleString()}</td>
                                    <td className="px-4 py-2">${amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">{leverage}x</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-400">
                    총 {trades.length}건 중 {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, trades.length)}
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        이전
                    </button>
                    <span className="font-bold">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    )
}
