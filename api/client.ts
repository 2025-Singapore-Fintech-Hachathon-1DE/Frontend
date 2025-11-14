/**
 * API Client for Singapore Detection System
 * 백엔드 API와 통신하는 클라이언트
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
    data?: T
    error?: string
}

/**
 * API 호출 래퍼
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error)
        throw error
    }
}

/**
 * 전체 탐지 통계
 */
export async function getStats() {
    return fetchApi<{
        total_detections: number
        wash_trading: number
        funding_fee: number
        cooperative: number
        total_sanctions: number
        bonus_details: {
            bot_tier: number
            manual_tier: number
            suspicious: number
        }
        funding_details: {
            critical: number
            high: number
            medium: number
        }
        cooperative_details: {
            critical: number
            high: number
            medium: number
        }
    }>('/api/stats')
}

/**
 * 모든 제재 케이스
 */
export async function getSanctions(model?: string, limit?: number) {
    const params = new URLSearchParams()
    if (model) params.append('model', model)
    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return fetchApi<
        Array<{
            id: string
            model: 'wash' | 'funding' | 'cooperative'
            timestamp: string
            type: string
            accounts: string[]
            score: number
            details: string
            raw: any
        }>
    >(`/api/sanctions${query}`)
}

/**
 * 모든 탐지 케이스 (제재 여부 포함)
 */
export async function getDetections(model?: string, limit?: number) {
    const params = new URLSearchParams()
    if (model) params.append('model', model)
    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return fetchApi<
        Array<{
            id: string
            model: 'wash' | 'funding' | 'cooperative'
            timestamp: string
            type: string
            accounts: string[]
            score: number
            is_sanctioned: boolean
            sanction_id?: string
            sanction_type?: string
            details: string
            raw: any
        }>
    >(`/api/detections${query}`)
}

/**
 * 시간별 탐지 추이
 */
export async function getTimeseries(interval: string = '1h') {
    return fetchApi<
        Array<{
            time: number
            WASH_TRADING: number
            FUNDING_FEE: number
            COOPERATIVE: number
        }>
    >(`/api/timeseries?interval=${interval}`)
}

/**
 * 상위 위반 계정
 */
export async function getTopAccounts(limit: number = 10) {
    return fetchApi<
        Array<{
            account_id: string
            total_cases: number
            total_profit_loss: number
            profits: {
                funding: number
                wash: number
                cooperative: number
            }
            avg_score: number
            max_score: number
            critical_count: number
            high_count: number
        }>
    >(`/api/top-accounts?limit=${limit}`)
}

/**
 * 시간대별 탐지 분포
 */
export async function getHourlyDistribution() {
    return fetchApi<{ [hour: number]: number }>('/api/hourly-distribution')
}

/**
 * 시각화 데이터
 */
export async function getVisualizationData(model?: string) {
    const query = model ? `?model=${model}` : ''
    return fetchApi<any>(`/api/visualization${query}`)
}

/**
 * 데이터 리로드
 */
export async function reloadData() {
    return fetchApi<{ status: string; message: string }>('/api/reload', {
        method: 'POST',
    })
}

/**
 * 특정 모델의 원본 데이터
 */
export async function getRawData(model: 'bonus' | 'funding' | 'cooperative') {
    return fetchApi<any>(`/api/raw/${model}`)
}

/**
 * 헬스 체크
 */
export async function healthCheck() {
    return fetchApi<{ status: string }>('/health')
}

/**
 * Trade pairs 데이터 가져오기
 */
export async function getTradePairs(model: 'wash' | 'cooperative' | 'funding') {
    return fetchApi<any[]>(`/api/trade-pairs/${model}`)
}

/**
 * Cooperative groups 데이터 가져오기
 */
export async function getCooperativeGroups() {
    return fetchApi<any[]>('/api/cooperative-groups')
}

/**
 * 특정 계정의 거래 이력 가져오기
 */
export async function getAccountTrades(accountId: string) {
    return fetchApi<any[]>(`/api/account/${accountId}/trades`)
}

/**
 * 특정 케이스의 상세 정보 가져오기
 */
export async function getCaseDetail(model: 'wash' | 'funding' | 'cooperative', caseId: string) {
    return fetchApi<any>(`/api/case/${model}/${caseId}`)
}

/**
 * 시뮬레이션 현재 상태 조회
 */
export async function getSimulationStatus() {
    return fetchApi<{
        current_time: string | null
        status: 'running' | 'not_initialized' | 'error'
        error?: string
    }>('/api/simulation/status')
}

/**
 * 시뮬레이션 진행 (N일 forward)
 */
export async function advanceSimulation(days: number = 7, hours: number = 0) {
    return fetchApi<{
        status: string
        current_time: string
        days_advanced: number
        hours_advanced: number
        message: string
    }>('/api/simulation/advance', {
        method: 'POST',
        body: JSON.stringify({ days, hours }),
    })
}

/**
 * 시뮬레이션 초기 상태로 리셋
 */
export async function resetSimulation() {
    return fetchApi<{
        status: string
        current_time: string
        message: string
    }>('/api/simulation/reset', {
        method: 'POST',
    })
}

/**
 * 특정 날짜로 시뮬레이션 이동
 * @param targetDate 목표 날짜 (YYYY-MM-DD 형식)
 */
export async function jumpToDate(targetDate: string) {
    // 현재 시뮬레이션 시간을 가져와서 차이 계산
    const status = await getSimulationStatus()
    if (!status.current_time) {
        throw new Error('시뮬레이션이 초기화되지 않았습니다')
    }

    const currentDate = new Date(status.current_time)
    const target = new Date(targetDate)

    // 날짜 차이 계산 (밀리초 -> 일)
    const diffMs = target.getTime() - currentDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        throw new Error('과거 날짜로는 이동할 수 없습니다. 리셋 후 다시 진행해주세요.')
    }

    if (diffDays === 0) {
        return {
            status: 'success',
            current_time: status.current_time,
            days_advanced: 0,
            hours_advanced: 0,
            message: '이미 해당 날짜입니다',
        }
    }

    // advance 호출
    return advanceSimulation(diffDays, 0)
}

/**
 * 모든 데이터를 한 번에 가져오기 (초기 로드용)
 */
export async function getAllData() {
    try {
        const [stats, detections, timeseries, topAccounts, hourlyDist, washPairs, coopGroups, fundingCases] = await Promise.all([
            getStats(),
            getDetections(undefined, 500), // 탐지 전체
            getTimeseries(),
            getTopAccounts(10),
            getHourlyDistribution(),
            getTradePairs('wash'),
            getCooperativeGroups(),
            getTradePairs('funding'),
        ])

        return {
            stats,
            detections,
            timeseries,
            topAccounts,
            hourlyDist,
            washTradingPairs: washPairs,
            cooperativeGroups: coopGroups,
            fundingFeeCases: fundingCases,
        }
    } catch (error) {
        console.error('Error fetching all data:', error)
        throw error
    }
}
