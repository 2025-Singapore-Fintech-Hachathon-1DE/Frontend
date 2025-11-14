/**
 * useSimulation Hook
 * 시뮬레이션 상태 관리 및 API 통합
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSimulationStatus, advanceSimulation, resetSimulation } from '../api/client'

interface SimulationState {
    isPlaying: boolean
    speed: number // seconds per day in simulation
    currentTime: Date | null
    simulationProgress: number // 0-100
    startDate: Date
    endDate: Date
}

export const useSimulation = (onDataUpdate?: () => void) => {
    const [state, setState] = useState<SimulationState>({
        isPlaying: false,
        speed: 86400, // 1 day = 86400 seconds (기본값: 1일이 실시간 1일)
        currentTime: null,
        simulationProgress: 0,
        startDate: new Date(2025, 1, 1), // 2025-02-01
        endDate: new Date(2025, 11, 31), // 2025-12-31
    })

    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // 시뮬레이션 상태 조회
    const fetchStatus = useCallback(async () => {
        try {
            const status = await getSimulationStatus()
            if (status.current_time) {
                const currentTime = new Date(status.current_time)
                setState((prev) => {
                    const totalDays = Math.floor((prev.endDate.getTime() - prev.startDate.getTime()) / (1000 * 60 * 60 * 24))
                    const elapsedDays = Math.floor((currentTime.getTime() - prev.startDate.getTime()) / (1000 * 60 * 60 * 24))
                    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))

                    return {
                        ...prev,
                        currentTime,
                        simulationProgress: progress,
                    }
                })
            }
        } catch (err) {
            console.error('Failed to fetch simulation status:', err)
            setError('시뮬레이션 상태 조회 실패')
        }
    }, [])

    // 초기 상태 로드
    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    // 시뮬레이션 진행 (advance)
    const advance = useCallback(
        async (days: number = 7) => {
            try {
                setError(null)
                console.log(`Advancing simulation by ${days} days...`)

                const result = await advanceSimulation(days, 0)
                console.log('Simulation advanced:', result)

                // 상태 업데이트
                await fetchStatus()

                // 데이터 리로드 트리거
                if (onDataUpdate) {
                    onDataUpdate()
                }

                return result
            } catch (err: any) {
                console.error('Failed to advance simulation:', err)
                setError(err.message || '시뮬레이션 진행 실패')
                throw err
            }
        },
        [fetchStatus, onDataUpdate]
    )

    // 자동 재생 로직
    useEffect(() => {
        if (state.isPlaying) {
            // speed는 "1일이 실시간 몇 초인가"
            // 예: speed=86400 → 1일이 실시간 1일 (86400초)
            // 예: speed=10 → 1일이 실시간 10초
            const intervalMs = state.speed * 1000 // 초를 밀리초로 변환

            intervalRef.current = setInterval(() => {
                advance(1).catch((err) => {
                    console.error('Auto-advance failed:', err)
                    setState((prev) => ({ ...prev, isPlaying: false }))
                })
            }, intervalMs)

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [state.isPlaying, state.speed, advance])

    // Play/Pause 토글
    const handlePlayPause = useCallback(() => {
        setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
    }, [])

    // 리셋
    const handleReset = useCallback(async () => {
        try {
            setError(null)
            setState((prev) => ({ ...prev, isPlaying: false }))

            console.log('Resetting simulation...')
            const result = await resetSimulation()
            console.log('Simulation reset:', result)

            // 상태 업데이트
            await fetchStatus()

            // 데이터 리로드 트리거
            if (onDataUpdate) {
                onDataUpdate()
            }

            return result
        } catch (err: any) {
            console.error('Failed to reset simulation:', err)
            setError(err.message || '시뮬레이션 리셋 실패')
            throw err
        }
    }, [fetchStatus, onDataUpdate])

    // 속도 변경
    const handleSpeedChange = useCallback((speed: number) => {
        setState((prev) => ({ ...prev, speed }))
    }, [])

    return {
        isPlaying: state.isPlaying,
        speed: state.speed,
        currentTime: state.currentTime,
        simulationProgress: state.simulationProgress,
        startDate: state.startDate,
        endDate: state.endDate,
        error,
        handlePlayPause,
        handleReset,
        handleSpeedChange,
        advance,
    }
}
