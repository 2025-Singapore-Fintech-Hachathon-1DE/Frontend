import React, { useState } from 'react'
import { LogEntry } from '../types'
import { PlayIcon, PauseIcon, RefreshIcon, ClockIcon, CalendarIcon, BellIcon } from './Icons'
import { SlackFeed } from './sidebar/SlackFeed'

interface SidebarProps {
    isOpen: boolean
    width: number
    onResizeStart: (e: React.MouseEvent) => void
    isPlaying: boolean
    speed: number
    onPlayPause: () => void
    onReset: () => void
    onSpeedChange: (speed: number) => void
    logs: LogEntry[]
    simulationProgress: number
    currentTime: Date
    startDate: Date
    endDate: Date
    isLoading?: boolean
    error?: string | null
    onSkipDays?: (days: number) => void
    onJumpToDate?: (date: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    width,
    onResizeStart,
    isPlaying,
    speed,
    onPlayPause,
    onReset,
    onSpeedChange,
    logs,
    simulationProgress,
    currentTime,
    startDate,
    endDate,
    isLoading = false,
    error = null,
    onSkipDays,
    onJumpToDate,
}) => {
    const [targetDate, setTargetDate] = useState('')
    // 아코디언 상태 관리
    const [showJumpToDate, setShowJumpToDate] = useState(true)
    const [showSpeed, setShowSpeed] = useState(true)
    const [showLogs, setShowLogs] = useState(true)
    const [showSlack, setShowSlack] = useState(true)

    const formatDate = (date: Date) => date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0]

    const handleJumpToDate = () => {
        if (targetDate && onJumpToDate) {
            onJumpToDate(targetDate)
        }
    }

    return (
        <aside
            style={{ width: `${width}px`, transform: isOpen ? 'translateX(0)' : `translateX(-${width}px)` }}
            className={`fixed top-0 left-0 bg-gray-800 p-4 flex flex-col h-full border-r border-gray-700 z-30 transition-transform duration-300 ease-in-out`}
        >
            <div className="h-full w-full overflow-scroll">
                <div className="bg-gray-900 rounded-lg p-3 mb-6 flex-shrink-0">
                    <div className="flex flex-row justify-between items-center mb-3 ">
                        <h2 className="text-lg font-semibold text-gray-200">시뮬레이터 제어</h2>
                        <h3
                            onClick={() => {
                                setShowJumpToDate(!showJumpToDate)
                                setShowSpeed(!showSpeed)
                            }}
                            className="text-md text-gray-400"
                        >
                            {!showJumpToDate ? '자세히' : '간략히'}
                        </h3>
                    </div>

                    {/* 에러 메시지 */}
                    {error && <div className="mb-3 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">{error}</div>}

                    {/* 재생/일시정지 및 리셋 */}
                    <div className="flex items-center space-x-2 mb-4">
                        <button
                            onClick={onPlayPause}
                            disabled={isLoading}
                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-grow flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>처리 중...</span>
                                </>
                            ) : (
                                <>
                                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    <span className="ml-2">{isPlaying ? '일시정지' : '재생'}</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onReset}
                            disabled={isLoading}
                            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="초기화"
                        >
                            <RefreshIcon />
                        </button>
                    </div>

                    {/* 건너뛰기 버튼들 */}
                    {onSkipDays && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">빠른 건너뛰기</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => onSkipDays(1)}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +1일
                                </button>
                                <button
                                    onClick={() => onSkipDays(7)}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +7일
                                </button>
                                <button
                                    onClick={() => onSkipDays(30)}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +30일
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 특정 날짜로 이동 (아코디언) */}
                    {onJumpToDate && showJumpToDate && (
                        <div className="mb-4">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setShowJumpToDate((v) => !v)}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-2">날짜로 이동</label>
                            </div>
                            {showJumpToDate && (
                                <div className="flex space-x-2 mt-1">
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        min={formatDateForInput(startDate)}
                                        max={formatDateForInput(endDate)}
                                        disabled={isLoading}
                                        className="flex-1 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleJumpToDate}
                                        disabled={isLoading || !targetDate}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        이동
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 재생 속도 (아코디언) */}
                    {showSpeed && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowSpeed((v) => !v)}>
                                <label htmlFor="speed" className="block text-sm font-medium text-gray-400 mb-1">
                                    재생 속도
                                </label>
                            </div>
                            {showSpeed && (
                                <select
                                    id="speed"
                                    value={speed}
                                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                                    disabled={isLoading}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 mt-1"
                                >
                                    <option value={1}>1초당 1일 (매우 빠름)</option>
                                    <option value={5}>5초당 1일 (빠름)</option>
                                    <option value={10}>10초당 1일 (보통)</option>
                                    <option value={30}>30초당 1일 (느림)</option>
                                    <option value={3600}>1시간당 1일 (매우 느림)</option>
                                </select>
                            )}
                        </div>
                    )}

                    {/* 시뮬레이션 정보 */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 text-gray-400" />
                            <span>
                                분석 기간: {formatDate(startDate)} ~ {formatDate(endDate)}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="mr-2 text-gray-400" />
                            <span>현재 시각: {currentTime.toLocaleString('ko-KR')}</span>
                        </div>
                    </div>
                </div>

                {/* <div className="bg-gray-900 rounded-lg p-4 mb-4 flex-shrink-0">
                <h3 className="text-md font-semibold mb-2 text-gray-200">진행률</h3>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${simulationProgress}%` }}></div>
                </div>
                <div className="text-right text-xs mt-1 text-gray-400">{simulationProgress.toFixed(1)}%</div>
            </div> */}

                <div className="flex h-fit max-h-[300px] bg-gray-900 rounded-lg p-3 flex flex-col overflow-hidden mb-4">
                    <div className="flex flex-row justify-between items-center ">
                        <h2 className="text-lg font-semibold text-gray-200 flex items-center flex-shrink-0">
                            <BellIcon className="mr-2" />
                            제재/알림 로그
                        </h2>
                        <h3
                            onClick={() => {
                                setShowLogs(!showLogs)
                            }}
                            className="text-md text-gray-400"
                        >
                            {showLogs ? '▲' : '▼'}
                        </h3>
                    </div>
                    {showLogs && (
                        <div className="flex-1 mt-3 overflow-y-auto pr-2 space-y-3">
                            {[...logs]
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .map((log) => (
                                    <div
                                        key={log.id}
                                        className="text-xs p-2 rounded-md border-l-4 bg-gray-800/50
              ${log.type === 'sanction' ? 'border-red-500' : 'border-yellow-400'}"
                                    >
                                        <p className="font-mono text-gray-300">{log.message}</p>
                                        <p className="text-gray-500 text-right mt-1">{new Date(log.timestamp).toLocaleTimeString('ko-KR')}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <SlackFeed logs={logs} />

                <div
                    onMouseDown={onResizeStart}
                    className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-40"
                />
            </div>
        </aside>
    )
}

export default Sidebar
