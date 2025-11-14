import React, { useState, useCallback, useMemo, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import { DetailModal } from './components/DetailModal'
import { ModelInfoModal } from './components/ModelInfoModal'
import { useApiData } from './hooks/useApiData'
import { useSimulation } from './hooks/useSimulation'
import {
    LogEntry,
    WashTradingHyperparameters,
    FundingFeeHyperparameters,
    CooperativeHyperparameters,
    DetailData,
    SanctionCase,
    DetectionCase,
} from './types'
import { MenuIcon, XIcon } from './components/Icons'

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(384) // lg:w-96
    const [isResizing, setIsResizing] = useState(false)

    const [washParams, setWashParams] = useState<WashTradingHyperparameters>({
        concurrency_threshold_sec: 30.0,
        quantity_tolerance_pct: 0.02,
        bot_tier_threshold: 90,
        manual_tier_threshold: 70,
        suspicious_threshold: 50,
    })

    const [fundingParams, setFundingParams] = useState<FundingFeeHyperparameters>({
        min_leverage: 5,
        max_holding_minutes: 20.0,
        critical_threshold: 85,
        high_threshold: 70,
    })

    const [coopParams, setCoopParams] = useState<CooperativeHyperparameters>({
        max_open_time_diff_min: 2.0,
        critical_threshold: 85,
        high_threshold: 70,
        min_shared_ips: 1,
    })

    const [selectedDetail, setSelectedDetail] = useState<DetailData | null>(null)
    const [isModelInfoOpen, setIsModelInfoOpen] = useState(false)

    const hyperparameters = useMemo(
        () => ({
            wash: washParams,
            funding: fundingParams,
            coop: coopParams,
        }),
        [washParams, fundingParams, coopParams]
    )

    // API에서 데이터 가져오기
    const apiData = useApiData()

    // 시뮬레이션 훅 (API 데이터 업데이트 트리거)
    const simulation = useSimulation(() => {
        // 시뮬레이션이 진행되면 데이터 리로드
        apiData.reload()
    })

    // 로그 생성 (API 데이터 기반)
    const logs = useMemo((): LogEntry[] => {
        return apiData.detections
            .filter((d) => d.is_sanctioned) // 제재된 케이스만 로그에 표시
            .map((detection) => {
                let message = ''
                let type: 'sanction' | 'alert' = 'alert'
                const score = detection.score || 0

                if (score >= 85 || score >= 90) {
                    // critical 또는 bot tier
                    type = 'sanction'
                    message = `[출금 정지] ID: ${detection.accounts[0]} (${detection.model} 확정) - 조치 완료`
                } else {
                    type = 'alert'
                    message = `[관리자 알림] ID: ${detection.accounts[0]} (${detection.model} 의심) - 담당자 Slack 전송`
                }

                return {
                    id: detection.id,
                    timestamp: typeof detection.timestamp === 'number' ? detection.timestamp : new Date(detection.timestamp).getTime(),
                    type,
                    message,
                }
            })
            .sort((a, b) => b.timestamp - a.timestamp)
    }, [apiData.detections])

    const slackMessages = useMemo(() => logs.filter((log) => log.type === 'alert'), [logs])

    const handleSelectDetail = (item: any, type: 'sanction' | 'account' | 'detection') => {
        setSelectedDetail({ type, data: item })
    }

    const handleCloseDetail = () => {
        setSelectedDetail(null)
    }

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }, [])

    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
    }, [])

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isResizing) {
                const newWidth = Math.min(Math.max(e.clientX, 280), 600)
                setSidebarWidth(newWidth)
            }
        },
        [isResizing]
    )

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    // 대시보드용 데이터 구성
    const dashboardData = useMemo(
        () => ({
            totalDetections: apiData.stats.totalDetections,
            washTradingDetections: apiData.stats.washTradingDetections,
            fundingFeeDetections: apiData.stats.fundingFeeDetections,
            cooperativeDetections: apiData.stats.cooperativeDetections,
            timeSeriesData: apiData.timeSeriesData,
            detections: apiData.detections,
            topFundingFeeAccounts: apiData.topAccounts,
            hourlyDistribution: apiData.hourlyDistribution,
        }),
        [apiData]
    )

    // 로딩 화면
    if (apiData.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">탐지 시스템 데이터 로딩 중...</p>
                </div>
            </div>
        )
    }

    // 에러 화면
    if (apiData.error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">데이터 로드 실패</h2>
                    <p className="text-gray-400 mb-4">{apiData.error}</p>
                    <button onClick={apiData.reload} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition">
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            {isResizing && (
                <style>{`
        body {
            cursor: col-resize !important;
            user-select: none !important;
        }
      `}</style>
            )}
            <Sidebar
                isOpen={isSidebarOpen}
                width={sidebarWidth}
                onResizeStart={handleMouseDown}
                isPlaying={simulation.isPlaying}
                speed={simulation.speed}
                onPlayPause={simulation.handlePlayPause}
                onReset={simulation.handleReset}
                onSpeedChange={simulation.handleSpeedChange}
                logs={logs}
                simulationProgress={simulation.simulationProgress}
                currentTime={simulation.currentTime || new Date()}
                startDate={simulation.startDate}
                endDate={simulation.endDate}
                isLoading={simulation.isLoading}
                error={simulation.error}
                onSkipDays={simulation.skipDays}
                onJumpToDate={simulation.jumpToDate}
            />
            <main className={`flex-1 overflow-y-auto transition-all duration-300`} style={{ marginLeft: isSidebarOpen ? sidebarWidth : 0 }}>
                <div className="p-4 md:p-6">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="fixed top-4 left-4 z-20 p-2 bg-gray-800/50 rounded-md text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"
                        aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
                        style={{ left: isSidebarOpen ? `${sidebarWidth + 16}px` : '16px', transition: 'left 0.3s ease-in-out' }}
                    >
                        {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                    <Dashboard
                        data={dashboardData}
                        hyperparameters={hyperparameters}
                        onWashParamsChange={setWashParams}
                        onFundingParamsChange={setFundingParams}
                        onCoopParamsChange={setCoopParams}
                        onSelectDetail={handleSelectDetail}
                        onOpenModelInfo={() => setIsModelInfoOpen(true)}
                        washTradingPairs={apiData.washTradingPairs}
                    />
                </div>
            </main>
            {selectedDetail && (
                <DetailModal
                    detail={selectedDetail}
                    onClose={handleCloseDetail}
                    allEvents={apiData.detections}
                    washTradingPairs={apiData.washTradingPairs}
                    cooperativeGroups={apiData.cooperativeGroups}
                    fundingFeeCases={apiData.fundingFeeCases}
                />
            )}
            {isModelInfoOpen && <ModelInfoModal onClose={() => setIsModelInfoOpen(false)} />}
        </div>
    )
}

export default App
