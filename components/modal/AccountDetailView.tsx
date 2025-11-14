import React, { useState, useEffect } from 'react'
import { TopAccount, SanctionCase, Trade } from '../../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TradeHistoryTable } from './TradeHistoryTable'
import { TradeDetailView } from './TradeDetailView'
import { getAccountTrades } from '../../api/client'

const Stat: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="bg-gray-700/50 p-3 rounded-md">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-md font-bold text-white truncate">{String(value) || 'N/A'}</p>
    </div>
)

const typeMapping: { [key: string]: string } = {
    IMMEDIATE_BOT: '봇 즉시 제재',
    NETWORK_REPEAT: '네트워크 반복',
    NETWORK_CHAIN: '네트워크 체인',
    CRITICAL: '펀딩비 악용 (Critical)',
    HIGH: '펀딩비 악용 (High)',
    COOPERATIVE_CRITICAL: '공모 거래 (Critical)',
}

type Tab = 'overview' | 'trades'

export const AccountDetailView: React.FC<{ account: TopAccount; allEvents: SanctionCase[] }> = ({ account, allEvents }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
    const [accountTrades, setAccountTrades] = useState<Trade[]>([])
    const [isLoadingTrades, setIsLoadingTrades] = useState(false)

    // 계정 거래 내역 로드
    useEffect(() => {
        const loadTrades = async () => {
            setIsLoadingTrades(true)
            try {
                const trades = await getAccountTrades(account.account_id)
                // API 데이터를 Trade 타입으로 변환
                const formattedTrades: Trade[] = trades.map((t: any) => {
                    // timestamp 처리
                    let timestamp: number
                    if (typeof t.timestamp === 'string') {
                        timestamp = new Date(t.timestamp).getTime()
                    } else if (typeof t.timestamp === 'number') {
                        timestamp = t.timestamp
                    } else {
                        timestamp = Date.now()
                    }

                    return {
                        trade_id: t.trade_id || '',
                        account_id: t.account_id || '',
                        timestamp: timestamp,
                        symbol: t.symbol || '',
                        side: t.side || 'LONG',
                        position_id: t.position_id || '',
                        leverage: Number(t.leverage) || 1,
                        price: Number(t.price) || 0,
                        quantity: Number(t.quantity) || 0,
                        amount: Number(t.amount) || 0,
                    }
                })
                setAccountTrades(formattedTrades)
            } catch (error) {
                console.error('Failed to load account trades:', error)
                setAccountTrades([])
            } finally {
                setIsLoadingTrades(false)
            }
        }

        loadTrades()
    }, [account.account_id])

    const relatedEvents = allEvents.filter((event) => event.accounts.includes(account.account_id)).sort((a, b) => a.timestamp - b.timestamp)

    const chartData = relatedEvents.map((event) => ({
        time: event.timestamp,
        score: event.score,
        type: event.model,
    }))

    if (selectedTrade) {
        return <TradeDetailView trade={selectedTrade} allTrades={accountTrades} onBack={() => setSelectedTrade(null)} />
    }

    const renderOverview = () => (
        <>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">계정별 탐지 이벤트 발생 차트</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis
                            dataKey="time"
                            tickFormatter={(time) => new Date(time).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                            stroke="#9CA3AF"
                            fontSize={12}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            labelFormatter={(label) => new Date(label).toLocaleString('ko-KR')}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="score" name="위험 점수" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">연루된 제재 내역</h3>
                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    시간
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    모델
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    제재 유형
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    점수
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedEvents.map((event) => (
                                <tr key={event.id} className="border-b border-gray-700">
                                    <td className="px-4 py-2 font-mono">{new Date(event.timestamp).toLocaleString('ko-KR')}</td>
                                    <td className="px-4 py-2">{event.model}</td>
                                    <td className="px-4 py-2">{typeMapping[event.type] || event.type}</td>
                                    <td className="px-4 py-2 font-bold">{event.score.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-400">계정: {account.account_id}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="총 탐지 횟수" value={account.total_cases} />
                <Stat label="총 PNL" value={`$${Math.round(account.total_profit_loss).toLocaleString()}`} />
                <Stat label="평균 점수" value={account.avg_score.toFixed(1)} />
                <Stat label="최고 점수" value={account.max_score.toFixed(1)} />
            </div>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                    >
                        개요
                    </button>
                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'trades'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                    >
                        거래 내역 ({accountTrades.length})
                    </button>
                </nav>
            </div>

            <div className="mt-4">
                {activeTab === 'overview' ? renderOverview() : <TradeHistoryTable trades={accountTrades} onSelectTrade={setSelectedTrade} />}
            </div>
        </div>
    )
}
