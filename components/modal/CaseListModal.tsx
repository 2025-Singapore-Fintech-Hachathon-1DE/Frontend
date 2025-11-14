import React, { useState } from 'react'
import { DetectionCase } from '../../types'

interface CaseListModalProps {
    cases: DetectionCase[]
    title: string
    onClose: () => void
    onSelectCase: (caseData: DetectionCase) => void
}

const ROWS_PER_PAGE = 15

const typeMapping: { [key: string]: string } = {
    IMMEDIATE_BOT: '봇 즉시 제재',
    NETWORK_REPEAT: '네트워크 반복',
    NETWORK_CHAIN: '네트워크 체인',
    CRITICAL: '펀딩비 악용 (Critical)',
    HIGH: '펀딩비 악용 (High)',
    MEDIUM: '펀딩비 악용 (Medium)',
    LOW: '펀딩비 악용 (Low)',
    COOPERATIVE_CRITICAL: '공모 거래 (Critical)',
    COOPERATIVE_HIGH: '공모 거래 (High)',
    COOPERATIVE_MEDIUM: '공모 거래 (Medium)',
}

export const CaseListModal: React.FC<CaseListModalProps> = ({ cases, title, onClose, onSelectCase }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState<'timestamp' | 'score'>('timestamp')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // 정렬
    const sortedCases = [...cases].sort((a, b) => {
        if (sortBy === 'timestamp') {
            return sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
        } else {
            return sortOrder === 'desc' ? b.score - a.score : a.score - b.score
        }
    })

    const totalPages = Math.ceil(sortedCases.length / ROWS_PER_PAGE)
    const paginatedCases = sortedCases.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(totalPages, page)))
    }

    const toggleSort = (field: 'timestamp' | 'score') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-red-400'
        if (score >= 85) return 'text-orange-400'
        if (score >= 70) return 'text-yellow-400'
        return 'text-green-400'
    }

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <p className="text-sm text-gray-400 mt-1">총 {cases.length}건의 탐지 케이스</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">
                                        케이스 ID
                                    </th>
                                    <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-gray-600" onClick={() => toggleSort('timestamp')}>
                                        시간 {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        모델
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        탐지 유형
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        관련 계정
                                    </th>
                                    <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-gray-600" onClick={() => toggleSort('score')}>
                                        점수 {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        상세보기
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCases.map((caseData) => (
                                    <tr
                                        key={caseData.id}
                                        className={`border-b border-gray-700 hover:bg-gray-700/50 ${caseData.is_sanctioned ? 'bg-red-900/20' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs">{caseData.id.substring(0, 8)}...</span>
                                                {caseData.is_sanctioned && (
                                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">제재</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(caseData.timestamp).toLocaleString('ko-KR')}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    caseData.model === 'wash'
                                                        ? 'bg-purple-900/50 text-purple-300'
                                                        : caseData.model === 'funding'
                                                        ? 'bg-blue-900/50 text-blue-300'
                                                        : 'bg-green-900/50 text-green-300'
                                                }`}
                                            >
                                                {caseData.model === 'wash' ? '자금세탁' : caseData.model === 'funding' ? '펀딩비' : '공모거래'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div>
                                                {typeMapping[caseData.type] || caseData.type}
                                                {caseData.is_sanctioned && caseData.sanction_type && (
                                                    <div className="text-red-400 text-[10px] mt-1">
                                                        제재: {typeMapping[caseData.sanction_type] || caseData.sanction_type}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {caseData.accounts.length > 2
                                                ? `${caseData.accounts.slice(0, 2).join(', ')}...`
                                                : caseData.accounts.join(', ')}
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${getScoreColor(caseData.score)}`}>{caseData.score.toFixed(1)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => onSelectCase(caseData)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                                            >
                                                보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {cases.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">탐지된 케이스가 없습니다.</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-700 p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                            {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, cases.length)} / 총 {cases.length}건
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                처음
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                이전
                            </button>
                            <span className="font-bold text-white">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                다음
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                마지막
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
