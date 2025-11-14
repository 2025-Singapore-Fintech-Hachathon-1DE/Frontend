/**
 * useApiData Hook
 * 실제 백엔드 API에서 데이터를 가져오는 훅
 */

import { useState, useEffect, useCallback } from 'react'
import { getAllData } from '../api/client'
import { DetectionCase, TopAccount, DetectionType } from '../types'

interface ApiDataState {
    isLoading: boolean
    error: string | null
    stats: {
        totalDetections: number
        washTradingDetections: number
        fundingFeeDetections: number
        cooperativeDetections: number
        totalSanctions: number
    }
    detections: DetectionCase[]
    timeSeriesData: Array<{ time: number } & { [key in DetectionType]: number }>
    topAccounts: TopAccount[]
    hourlyDistribution: { [hour: number]: number }
    washTradingPairs: any[]
    cooperativeGroups: any[]
    fundingFeeCases: any[]
}

export const useApiData = () => {
    const [state, setState] = useState<ApiDataState>({
        isLoading: true,
        error: null,
        stats: {
            totalDetections: 0,
            washTradingDetections: 0,
            fundingFeeDetections: 0,
            cooperativeDetections: 0,
            totalSanctions: 0,
        },
        detections: [],
        timeSeriesData: [],
        topAccounts: [],
        hourlyDistribution: {},
        washTradingPairs: [],
        cooperativeGroups: [],
        fundingFeeCases: [],
    })

    const loadData = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        try {
            const data = await getAllData()

            // Stats 변환
            const stats = {
                totalDetections: data.stats.total_detections,
                washTradingDetections: data.stats.wash_trading,
                fundingFeeDetections: data.stats.funding_fee,
                cooperativeDetections: data.stats.cooperative,
                totalSanctions: data.stats.total_sanctions,
            }

            // Detections 변환 (제재 여부 포함)
            const detections: DetectionCase[] = data.detections.map((d) => ({
                id: d.id,
                model: d.model,
                timestamp: typeof d.timestamp === 'string' ? new Date(d.timestamp).getTime() : d.timestamp,
                type: d.type,
                accounts: d.accounts,
                details: d.details,
                score: d.score,
                is_sanctioned: d.is_sanctioned,
                sanction_id: d.sanction_id,
                sanction_type: d.sanction_type,
                launderedAmount: d.raw.laundered_amount || d.raw.total_laundered_amount,
                raw: d.raw,
            }))

            // TimeSeries 변환
            const timeSeriesData = data.timeseries.map((ts) => ({
                time: ts.time,
                [DetectionType.WashTrading]: ts.WASH_TRADING,
                [DetectionType.FundingFee]: ts.FUNDING_FEE,
                [DetectionType.Cooperative]: ts.COOPERATIVE,
            }))

            // TopAccounts 변환
            const topAccounts: TopAccount[] = data.topAccounts.map((acc) => ({
                account_id: acc.account_id,
                total_cases: acc.total_cases,
                total_profit_loss: acc.total_profit_loss,
                profits: acc.profits,
                avg_score: acc.avg_score,
                max_score: acc.max_score,
                critical_count: acc.critical_count,
                high_count: acc.high_count,
            }))

            setState({
                isLoading: false,
                error: null,
                stats,
                detections,
                timeSeriesData,
                topAccounts,
                hourlyDistribution: data.hourlyDist,
                washTradingPairs: data.washTradingPairs || [],
                cooperativeGroups: data.cooperativeGroups || [],
                fundingFeeCases: data.fundingFeeCases || [],
            })
        } catch (error: any) {
            console.error('Failed to load API data:', error)
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to load data from API',
            }))
        }
    }, [])

    // 초기 데이터 로드
    useEffect(() => {
        loadData()
    }, [loadData])

    return {
        ...state,
        reload: loadData,
    }
}
