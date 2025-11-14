import React, { useState, useMemo } from 'react'
import { DetectionCase, TopAccount } from '../../types'

type Period = 'day' | 'week' | 'month'
type Model = 'all' | 'funding' | 'wash' | 'cooperative'

interface TopAccountsPanelProps {
    allDetections: DetectionCase[]
    onSelectAccount: (account: TopAccount) => void
    washTradingPairs?: Array<{ pair_id: string; winner_account: string }>
}

const calculateTopAccounts = (
    detections: DetectionCase[],
    period: Period,
    model: Model,
    washTradingPairs: Array<{ pair_id: string; winner_account: string }> = []
): TopAccount[] => {
    // 탐지 데이터의 최신 시간을 기준으로 사용 (시뮬레이션 시간 고려)
    const allTimestamps = detections.map((d) => (typeof d.timestamp === 'number' ? d.timestamp : new Date(d.timestamp).getTime()))
    const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : Date.now()

    let startTime = 0
    if (period === 'day') startTime = maxTime - 24 * 60 * 60 * 1000
    if (period === 'week') startTime = maxTime - 7 * 24 * 60 * 60 * 1000
    if (period === 'month') startTime = maxTime - 30 * 24 * 60 * 60 * 1000

    const filteredDetections = detections.filter((d) => {
        const ts = typeof d.timestamp === 'number' ? d.timestamp : new Date(d.timestamp).getTime()
        return ts >= startTime && (model === 'all' || d.model === model)
    })

    const accountStats: { [key: string]: { cases: DetectionCase[]; profits: { funding: number; wash: number; cooperative: number } } } = {}

    filteredDetections.forEach((detection) => {
        detection.accounts.forEach((accId) => {
            if (!accountStats[accId]) {
                accountStats[accId] = { cases: [], profits: { funding: 0, wash: 0, cooperative: 0 } }
            }
            accountStats[accId].cases.push(detection)

            if (detection.model === 'funding') {
                // window_funding 사용 (DetectionCase)
                accountStats[accId].profits.funding += detection.raw.window_funding || detection.window_funding || 0
            } else if (detection.model === 'wash') {
                // DetectionCase - raw에서 직접 확인
                if (detection.raw.winner_account === accId) {
                    accountStats[accId].profits.wash += detection.raw.laundered_amount || detection.laundered_amount || 0
                }
                // SanctionCase - fallback
                else {
                    const winnerAccountsInCase = new Set(
                        washTradingPairs.filter((p) => detection.raw.trade_pair_ids?.includes(p.pair_id)).map((p) => p.winner_account)
                    )
                    if (winnerAccountsInCase.has(accId)) {
                        accountStats[accId].profits.wash += (detection.laundered_amount || 0) / (winnerAccountsInCase.size || 1)
                    }
                }
            } else if (detection.model === 'cooperative') {
                // DetectionCase - raw에서 PNL 분배
                if (detection.raw.account_id1 === accId) {
                    accountStats[accId].profits.cooperative += detection.raw.rpnl1 || 0
                } else if (detection.raw.account_id2 === accId) {
                    accountStats[accId].profits.cooperative += detection.raw.rpnl2 || 0
                } else {
                    // fallback - 균등 분배
                    accountStats[accId].profits.cooperative +=
                        (detection.raw.pnl_total || detection.total_pnl || 0) / (detection.accounts.length || 1)
                }
            }
        })
    })

    const topAccounts: TopAccount[] = Object.entries(accountStats).map(([accountId, stats]) => {
        const totalCases = stats.cases.length
        const totalScore = stats.cases.reduce((sum, d) => sum + d.score, 0)
        const maxScore = Math.max(...stats.cases.map((d) => d.score))
        const total_profit_loss = stats.profits.funding + stats.profits.wash + stats.profits.cooperative
        return {
            account_id: accountId,
            total_cases: totalCases,
            total_profit_loss: total_profit_loss,
            profits: stats.profits,
            avg_score: totalCases > 0 ? totalScore / totalCases : 0,
            max_score: maxScore,
            critical_count: stats.cases.filter((d) => d.score >= 85).length,
            high_count: stats.cases.filter((d) => d.score >= 70 && d.score < 85).length,
        }
    })

    return topAccounts.sort((a, b) => b.total_profit_loss - a.total_profit_loss).slice(0, 5)
}

export const TopAccountsPanel: React.FC<TopAccountsPanelProps> = ({ allDetections, onSelectAccount, washTradingPairs = [] }) => {
    const [period, setPeriod] = useState<Period>('month')
    const [model, setModel] = useState<Model>('all')

    const topAccounts = useMemo(
        () => calculateTopAccounts(allDetections, period, model, washTradingPairs),
        [allDetections, period, model, washTradingPairs]
    )

    const modelNames: Record<Model, string> = { all: '전체', funding: '펀딩비', wash: '자금세탁', cooperative: '공모' }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
            <div className="mb-4">
                <h3 className="text-md font-semibold text-white">상위 의심 계정 (Top 5)</h3>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-1 bg-gray-700 p-1 rounded-md">
                        {(['day', 'week', 'month'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                    period === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'
                                }`}
                            >
                                {p === 'day' && '일'}
                                {p === 'week' && '주'}
                                {p === 'month' && '월'}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-1 bg-gray-700 p-1 rounded-md">
                        {(['all', 'funding', 'wash', 'cooperative'] as Model[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setModel(m)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                    model === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'
                                }`}
                            >
                                {modelNames[m]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {topAccounts.map((account, index) => (
                    <div
                        key={account.account_id}
                        className="bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => onSelectAccount(account)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <span className="text-sm font-bold text-gray-300 mr-2">{index + 1}.</span>
                                <span className="font-mono text-sm text-blue-400">{account.account_id}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-green-400">${Math.round(account.total_profit_loss).toLocaleString()}</span>
                                <span className="text-xs text-gray-400 block">총 PNL</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>탐지 횟수: {account.total_cases}</span>
                            <span>평균 점수: {account.avg_score.toFixed(1)}</span>
                            <span>최고 점수: {account.max_score.toFixed(1)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
