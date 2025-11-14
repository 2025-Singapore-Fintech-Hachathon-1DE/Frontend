import React, { useState, useMemo, useEffect } from 'react'
import { washTradingModelInfo, fundingFeeModelInfo, cooperativeModelInfo } from '../model_description'
import { getVisualizationData } from '../api/client'
import { DistributionBarChart } from './visualization/DistributionBarChart'
import { NetworkGraph } from './visualization/NetworkGraph'

interface ModelInfoModalProps {
    onClose: () => void
}

type Tab = 'wash' | 'funding' | 'cooperative'

interface VisualizationData {
    bonus?: any
    funding?: any
    cooperative?: any
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // This helper function handles **bold** syntax.
    const renderLine = (line: string) => {
        return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>
            }
            return part
        })
    }

    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]
        const trimmedLine = line.trim()

        if (trimmedLine.startsWith('#')) {
            const level = trimmedLine.match(/^#+/)?.[0].length || 0
            const text = trimmedLine.substring(level).trim()
            if (level === 1) {
                elements.push(
                    <h1 key={i} className="text-xl font-bold mb-3 mt-4 border-b border-gray-600 pb-2">
                        {renderLine(text)}
                    </h1>
                )
            } else if (level === 2) {
                elements.push(
                    <h2 key={i} className="text-lg font-semibold mt-6 mb-2 border-b border-gray-700 pb-1">
                        {renderLine(text)}
                    </h2>
                )
            } else {
                elements.push(
                    <h3 key={i} className="text-md font-semibold mt-4 mb-1">
                        {renderLine(text)}
                    </h3>
                )
            }
            i++
        } else if (trimmedLine.startsWith('- ')) {
            const listItems = []
            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                const itemLine = lines[i]
                const indentation = itemLine.match(/^\s*/)?.[0].length || 0
                const itemText = itemLine.trim().substring(2)
                // Basic indentation for nested lists, not full nesting.
                listItems.push(
                    <li key={i} style={{ marginLeft: `${indentation > 2 ? (indentation - 2) * 8 : 0}px` }}>
                        {renderLine(itemText)}
                    </li>
                )
                i++
            }
            elements.push(
                <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">
                    {listItems}
                </ul>
            )
        } else if (trimmedLine.startsWith('```')) {
            const codeLines = []
            i++
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i])
                i++
            }
            elements.push(
                <pre key={`pre-${i}`} className="bg-gray-900 p-3 rounded-md text-xs text-gray-300 overflow-x-auto my-4">
                    <code>{codeLines.join('\n')}</code>
                </pre>
            )
            i++ // skip the closing ```
        } else if (trimmedLine.includes('|') && i + 1 < lines.length && lines[i + 1].trim().replace(/[-:|\s]/g, '') === '') {
            const headers = line
                .split('|')
                .slice(1, -1)
                .map((h) => h.trim())
            const headerRow = (
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        {headers.map((h, j) => (
                            <th key={j} className="p-2 border border-gray-600 font-semibold">
                                {renderLine(h)}
                            </th>
                        ))}
                    </tr>
                </thead>
            )

            i += 2 // Skip header and separator line
            const bodyRows = []
            while (i < lines.length && lines[i].trim().includes('|')) {
                const cells = lines[i]
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim())
                bodyRows.push(
                    <tr key={i} className="border-b border-gray-600 bg-gray-800">
                        {cells.map((c, j) => (
                            <td key={j} className="p-2 border border-gray-600 text-sm">
                                {renderLine(c)}
                            </td>
                        ))}
                    </tr>
                )
                i++
            }
            elements.push(
                <table key={`table-${i}`} className="w-full my-4 border-collapse border border-gray-600 text-left text-gray-300">
                    {headerRow}
                    <tbody>{bodyRows}</tbody>
                </table>
            )
        } else if (trimmedLine) {
            elements.push(
                <p key={i} className="my-2 text-sm text-gray-300 leading-relaxed">
                    {renderLine(line)}
                </p>
            )
            i++
        } else {
            i++ // empty line, do nothing
        }
    }

    return <div className="text-gray-300 leading-relaxed">{elements}</div>
}

export const ModelInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('wash')
    const [visData, setVisData] = useState<VisualizationData>({})
    const [isLoading, setIsLoading] = useState(true)

    // API에서 visualization 데이터 로드
    useEffect(() => {
        const loadVisData = async () => {
            setIsLoading(true)
            try {
                const data = await getVisualizationData()
                setVisData(data)
            } catch (error) {
                console.error('Failed to load visualization data:', error)
                setVisData({})
            } finally {
                setIsLoading(false)
            }
        }

        loadVisData()
    }, [])

    const washTradingVisData = visData.bonus || {}
    const fundingFeeVisData = visData.funding || {}
    const cooperativeVisData = visData.cooperative || {}

    const washEdges = useMemo(() => {
        if (!washTradingVisData.network_graph?.edges) return []
        return washTradingVisData.network_graph.edges.map((edge: any) => ({
            source: edge.source,
            target: edge.target,
            amount: edge.value,
            score: edge.score,
        }))
    }, [washTradingVisData])

    const coopEdges = useMemo(() => {
        if (!cooperativeVisData.network_graph?.edges) return []
        return cooperativeVisData.network_graph.edges.map((edge: any) => ({
            source: edge.source,
            target: edge.target,
            amount: edge.value,
            score: edge.score,
        }))
    }, [cooperativeVisData])

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">시각화 데이터 로딩 중...</p>
                    </div>
                </div>
            )
        }

        switch (activeTab) {
            case 'wash':
                const washScoreData = washTradingVisData.score_distribution
                    ? Object.entries(washTradingVisData.score_distribution).map(([key, value]) => ({ name: key, value }))
                    : []
                const washTierData = washTradingVisData.tier_distribution
                    ? Object.entries(washTradingVisData.tier_distribution).map(([key, value]) => ({ name: key, value }))
                    : []

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <div className="overflow-y-auto pr-4">
                            <MarkdownRenderer content={washTradingModelInfo} />
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-4">
                            <DistributionBarChart title="점수 분포" data={washScoreData} />
                            <DistributionBarChart title="등급 분포" data={washTierData} />
                            <h3 className="text-md font-semibold text-white mt-4">네트워크 그래프 예시</h3>
                            <div className="bg-gray-900/50 rounded-lg p-2 h-64">
                                {washTradingVisData.network_graph?.nodes && washEdges.length > 0 ? (
                                    <NetworkGraph nodes={washTradingVisData.network_graph.nodes} edges={washEdges} />
                                ) : (
                                    <p className="text-gray-400 text-center mt-20">네트워크 데이터가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            case 'funding':
                const fundingScoreData = fundingFeeVisData.score_distribution
                    ? Object.entries(fundingFeeVisData.score_distribution).map(([key, value]) => ({ name: key, value }))
                    : []
                const fundingSeverityData = fundingFeeVisData.severity_distribution
                    ? Object.entries(fundingFeeVisData.severity_distribution).map(([key, value]) => ({ name: key, value }))
                    : []
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <div className="overflow-y-auto pr-4">
                            <MarkdownRenderer content={fundingFeeModelInfo} />
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-4">
                            <DistributionBarChart title="점수 분포" data={fundingScoreData} />
                            <DistributionBarChart title="심각도 분포" data={fundingSeverityData} />
                        </div>
                    </div>
                )
            case 'cooperative':
                const coopRiskData = cooperativeVisData.risk_distribution
                    ? Object.entries(cooperativeVisData.risk_distribution).map(([key, value]) => ({ name: key, value }))
                    : []
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <div className="overflow-y-auto pr-4">
                            <MarkdownRenderer content={cooperativeModelInfo} />
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-4">
                            <DistributionBarChart title="위험도 분포" data={coopRiskData} />
                            <h3 className="text-md font-semibold text-white mt-4">네트워크 그래프 예시</h3>
                            <div className="bg-gray-900/50 rounded-lg p-2 h-80">
                                {cooperativeVisData.network_graph?.nodes && coopEdges.length > 0 ? (
                                    <NetworkGraph nodes={cooperativeVisData.network_graph.nodes} edges={coopEdges} />
                                ) : (
                                    <p className="text-gray-400 text-center mt-32">네트워크 데이터가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => setActiveTab('wash')}
                                className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'wash'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                                자금세탁 (Wash Trading)
                            </button>
                            <button
                                onClick={() => setActiveTab('funding')}
                                className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'funding'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                                펀딩비 악용
                            </button>
                            <button
                                onClick={() => setActiveTab('cooperative')}
                                className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'cooperative'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                                공모 거래
                            </button>
                        </nav>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-1 overflow-hidden p-6">{renderContent()}</div>
            </div>
        </div>
    )
}
