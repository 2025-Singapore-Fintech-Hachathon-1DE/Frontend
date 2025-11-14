import React, { useMemo } from 'react'
import { SanctionCase } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { NetworkGraph } from '../visualization/NetworkGraph'
import { RelatedTradesTable } from './RelatedTradesTable'

interface SanctionDetailViewProps {
    sanction: SanctionCase
    washTradingPairs: any[]
    cooperativeGroups: any[]
    fundingFeeCases: any[]
}

const Stat: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="bg-gray-700/50 p-3 rounded-md">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-md font-bold text-white truncate">{value || 'N/A'}</p>
    </div>
)

const modelDescriptions: Record<SanctionCase['model'], { title: string; desc: string }> = {
    wash: {
        title: '자금세탁 (Wash Trading)',
        desc: '두 개 이상의 계정이 서로 짜고 거래하여 거래량을 부풀리거나, 손실을 특정 계정에 몰아주어 증정금을 현금화하는 비정상적 거래 패턴을 탐지합니다.',
    },
    funding: {
        title: '펀딩비 악용 (Funding Fee Abuse)',
        desc: '펀딩비 지급 시점에만 포지션을 보유하여 비정상적으로 펀딩 수익을 편취하려는 단기 거래 패턴을 탐지합니다.',
    },
    cooperative: {
        title: '공모 거래 (Cooperative Trading)',
        desc: '여러 계정이 동일 IP를 사용하거나, 매우 근접한 시간에 유사한 패턴의 거래를 실행하여 시세를 조작하려는 의심스러운 그룹 거래를 탐지합니다.',
    },
}

const typeDescriptions: Record<string, { title: string; desc: string }> = {
    IMMEDIATE_BOT: { title: '봇 즉시 제재', desc: '자동화된 프로그램(봇)으로 판단되는 명백한 패턴의 자금세탁 행위입니다. 즉시 제재 대상입니다.' },
    NETWORK_REPEAT: { title: '네트워크 반복', desc: '특정 계정이 네트워크 내에서 반복적으로 수익을 올리는 패턴입니다. 수동 검토가 필요합니다.' },
    CRITICAL: { title: 'Critical 등급', desc: '탐지 점수가 매우 높아 악의적인 의도가 명백하다고 판단되는 케이스입니다. 즉시 제재 대상입니다.' },
    HIGH: { title: 'High 등급', desc: '악용 가능성이 매우 높은 것으로 판단되는 케이스입니다. 면밀한 모니터링 또는 수동 검토가 필요합니다.' },
    COOPERATIVE_CRITICAL: {
        title: '공모 거래 (Critical)',
        desc: '여러 지표를 종합했을 때 명백한 공모 거래로 판단되는 그룹입니다. 그룹 전체에 대한 조사가 필요합니다.',
    },
}

const getScoreBreakdown = (sanction: SanctionCase, washTradingPairs: any[], fundingFeeCases: any[], cooperativePairs: any[]) => {
    if (sanction.model === 'wash' && sanction.raw.trade_pair_ids) {
        const pair = washTradingPairs.find((p) => p.pair_id === sanction.raw.trade_pair_ids[0])
        if (!pair) return []
        return [
            { name: 'PNL 미러링', value: pair.score_pnl_mirroring },
            { name: '동시성', value: pair.score_concurrency },
            { name: '수량 일치', value: pair.score_quantity },
            { name: '가치 비율', value: pair.score_trade_ratio },
        ]
    }
    if (sanction.model === 'funding' && sanction.raw.case_id) {
        const pair = fundingFeeCases.find((p) => p.case_id === sanction.raw.case_id)
        if (!pair) return []
        return [
            { name: '펀딩 수익', value: pair.score_funding },
            { name: '보유 시간', value: pair.score_holding },
            { name: '레버리지', value: pair.score_leverage },
            { name: '포지션 크기', value: pair.score_position },
        ]
    }
    if (sanction.model === 'cooperative' && sanction.raw.group_id) {
        const pair = cooperativePairs.find((p) => p.group_id === sanction.raw.group_id)
        if (!pair) return []
        return [
            { name: 'PNL 비대칭', value: pair.score_pnl_asymmetry },
            { name: '시간 근접성', value: pair.score_time_proximity },
            { name: 'IP 공유', value: pair.score_ip_sharing },
            { name: '포지션 중첩', value: pair.score_position_overlap },
        ]
    }
    return []
}

export const SanctionDetailView: React.FC<SanctionDetailViewProps> = ({ sanction, washTradingPairs, cooperativeGroups, fundingFeeCases }) => {
    // cooperativePairs는 raw 데이터에서 직접 추출 (cooperativeGroups와 다름)
    const cooperativePairs = washTradingPairs // TODO: cooperative pairs 별도 API 필요시 수정

    const scoreData = getScoreBreakdown(sanction, washTradingPairs, fundingFeeCases, cooperativePairs)
    const modelInfo = modelDescriptions[sanction.model]
    const typeInfo = typeDescriptions[sanction.type] || { title: sanction.type, desc: '정의되지 않은 제재 유형입니다.' }

    const isNetworkSanction = sanction.model === 'wash' || sanction.model === 'cooperative'

    const networkData = useMemo(() => {
        if (!isNetworkSanction) return null

        const nodes = sanction.accounts.map((id) => ({ id }))
        let edges: any[] = []
        let trades: any[] = []

        if (sanction.model === 'wash') {
            trades = washTradingPairs.filter((p) => sanction.raw.trade_pair_ids?.includes(p.pair_id))
            edges = trades
                .map((t) => ({
                    source: t.loser_account,
                    target: t.winner_account,
                    amount: t.laundered_amount,
                    score: t.total_score,
                }))
                .filter((e) => e.source && e.target)
        } else if (sanction.model === 'cooperative') {
            trades = cooperativePairs.filter((p) => p.group_id === sanction.raw.group_id)
            const members = sanction.accounts
            if (members.length > 1) {
                for (let i = 0; i < members.length; i++) {
                    for (let j = i + 1; j < members.length; j++) {
                        edges.push({ source: members[i], target: members[j], amount: 0, score: 0 }) // Show connection
                    }
                }
            }
        }
        return { nodes, edges, trades }
    }, [sanction, isNetworkSanction, washTradingPairs, cooperativePairs])

    const renderTradeDetails = () => {
        if (sanction.model === 'wash' && sanction.raw.trade_pair_ids) {
            const pairData = washTradingPairs.find((p) => p.pair_id === sanction.raw.trade_pair_ids[0])
            if (!pairData) return <p>거래 내역을 찾을 수 없습니다.</p>
            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <Stat label="심볼" value={pairData.symbol} />
                    <Stat label="수익 계정" value={pairData.winner_account} />
                    <Stat label="손실 계정" value={pairData.loser_account} />
                    <Stat label="현금화 금액" value={`$${(pairData.laundered_amount || 0).toFixed(2)}`} />
                    <Stat label="레버리지" value={`${pairData.leverage}x`} />
                    <Stat label="거래 동시성(초)" value={(pairData.open_time_diff_sec || 0).toFixed(4)} />
                </div>
            )
        }
        if (sanction.model === 'funding' && sanction.raw.case_id) {
            const caseData = fundingFeeCases.find((p) => p.case_id === sanction.raw.case_id)
            if (!caseData) return <p>거래 내역을 찾을 수 없습니다.</p>
            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <Stat label="심볼" value={caseData.symbol} />
                    <Stat label="레버리지" value={`${caseData.leverage}x`} />
                    <Stat label="포지션 보유 시간(분)" value={(caseData.holding_minutes || 0).toFixed(2)} />
                    <Stat label="총 펀딩 수익" value={`$${(caseData.total_funding || 0).toLocaleString()}`} />
                    <Stat label="거래량" value={(caseData.amount || 0).toLocaleString()} />
                    <Stat label="심각도" value={caseData.severity} />
                </div>
            )
        }
        if (sanction.model === 'cooperative' && sanction.raw.group_id) {
            const groupData = cooperativeGroups.find((g) => g.group_id === sanction.raw.group_id)
            if (!groupData) return <p>거래 내역을 찾을 수 없습니다.</p>
            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <Stat label="그룹 ID" value={groupData.group_id} />
                    <Stat label="멤버 수" value={groupData.member_count} />
                    <Stat label="총 거래 수" value={groupData.trade_count} />
                    <Stat label="공유 IP 수" value={groupData.shared_ip_count} />
                    <Stat label="총 PNL" value={`$${(groupData.pnl_total || 0).toFixed(2)}`} />
                    <Stat label="위험 레벨" value={groupData.risk_level} />
                </div>
            )
        }
        return <p>상세 거래 내역을 찾을 수 없습니다.</p>
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-900/50 rounded-lg">
                {modelInfo && <p className="text-sm text-gray-300">{modelInfo.desc}</p>}
                {typeInfo && <p className="text-xs text-gray-400 mt-2">{typeInfo.desc}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Case ID" value={sanction.id} />
                <Stat label="모델" value={modelInfo?.title || sanction.model} />
                <Stat label="타입" value={typeInfo?.title || sanction.type} />
                <Stat label="점수" value={sanction.score.toFixed(1)} />
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">세부 정보</h3>
                {renderTradeDetails()}
            </div>

            {isNetworkSanction && networkData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">네트워크 시각화</h3>
                        <div className="bg-gray-900/50 rounded-lg p-2 h-80">
                            <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">연관 거래 내역</h3>
                        <div className="max-h-80 overflow-y-auto">
                            {sanction.model !== 'funding' && <RelatedTradesTable trades={networkData.trades} model={sanction.model} />}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">점수 분석</h3>
                {scoreData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={scoreData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={80} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#FFF' }}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" background={{ fill: 'rgba(75, 85, 99, 0.5)' }} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-sm text-gray-400">점수 분석 데이터가 없습니다.</p>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Raw 데이터</h3>
                <pre className="bg-gray-900 p-3 rounded-md text-xs text-gray-300 overflow-x-auto max-h-48">
                    {JSON.stringify(sanction.raw, null, 2)}
                </pre>
            </div>
        </div>
    )
}
