import React, { useState, useMemo } from 'react'
import { DetectionCase } from '../../types'

interface SanctionsTablePanelProps {
    title: string
    detections: DetectionCase[]
    onSelectDetection: (detection: DetectionCase) => void
}

const typeMapping: { [key: string]: string } = {
    IMMEDIATE_BOT: '봇 즉시 제재',
    NETWORK_REPEAT: '네트워크 반복',
    NETWORK_CHAIN: '네트워크 체인',
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    COOPERATIVE_CRITICAL: '공모 거래 (Critical)',
    COOPERATIVE_HIGH: '공모 거래 (High)',
    COOPERATIVE_MEDIUM: '공모 거래 (Medium)',
}

const getBackgroundColor = (detection: DetectionCase) => {
    if (detection.is_sanctioned) {
        if (detection.score >= 90) return 'bg-red-500/30 hover:bg-red-500/40'
        if (detection.score >= 70) return 'bg-orange-500/30 hover:bg-orange-500/40'
        return 'bg-yellow-500/20 hover:bg-yellow-500/30'
    }
    return 'bg-gray-500/10 hover:bg-gray-500/20'
}

export const SanctionsTablePanel: React.FC<SanctionsTablePanelProps> = ({ title, detections, onSelectDetection }) => {
    const [modelFilter, setModelFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all') // all, sanctioned, detected

    const detectionTypes = useMemo(() => {
        const types = new Set(detections.map((d) => d.type))
        return ['all', ...Array.from(types)]
    }, [detections])

    const filteredDetections = useMemo(() => {
        return detections.filter((d) => {
            const modelMatch = modelFilter === 'all' || d.model === modelFilter
            const typeMatch = typeFilter === 'all' || d.type === typeFilter
            const statusMatch =
                statusFilter === 'all' || (statusFilter === 'sanctioned' && d.is_sanctioned) || (statusFilter === 'detected' && !d.is_sanctioned)
            return modelMatch && typeMatch && statusMatch
        })
    }, [detections, modelFilter, typeFilter, statusFilter])

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-white">{title}</h3>
                <div className="flex items-center space-x-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-1 bg-gray-700 border border-gray-600 rounded-md text-white text-xs focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">전체</option>
                        <option value="sanctioned">제재만</option>
                        <option value="detected">탐지만</option>
                    </select>
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
                        {detectionTypes
                            .filter((t) => t !== 'all')
                            .map((type) => (
                                <option key={type} value={type}>
                                    {typeMapping[type] || type}
                                </option>
                            ))}
                    </select>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 w-5 py-3">
                                상태
                            </th>
                            <th scope="col" className="px-4 py-3">
                                시간
                            </th>
                            <th scope="col" className="px-4 py-3">
                                계정 ID
                            </th>
                            <th scope="col" className="px-4 py-3">
                                탐지 유형
                            </th>
                            <th scope="col" className="px-4 py-3">
                                점수
                            </th>
                            <th scope="col" className="px-4 py-3">
                                상세
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDetections.slice(0, 50).map((d) => (
                            <tr
                                key={d.id}
                                className={`border-b border-gray-700 cursor-pointer transition-colors ${getBackgroundColor(d)}`}
                                onClick={() => onSelectDetection(d)}
                            >
                                <td className="px-4 py-2">
                                    {d.is_sanctioned && <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">제재</span>}
                                </td>
                                <td className="px-4 py-2 font-mono">{new Date(d.timestamp).toLocaleTimeString('ko-KR')}</td>
                                <td className="px-4 py-2 font-mono truncate max-w-xs">{d.accounts.join(', ')}</td>
                                <td className="px-4 py-2">
                                    <div>
                                        {typeMapping[d.type] || d.type}
                                        {d.is_sanctioned && d.sanction_type && (
                                            <div className="text-red-400 text-[10px] mt-1">
                                                제재: {typeMapping[d.sanction_type] || d.sanction_type}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2 font-bold">{d.score.toFixed(1)}</td>
                                <td className="px-4 py-2 truncate max-w-xs">{d.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
