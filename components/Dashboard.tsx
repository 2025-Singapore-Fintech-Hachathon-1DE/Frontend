import React from 'react'
import { StatPanel } from './panels/StatPanel'
import { TimeSeriesPanel } from './panels/TimeSeriesPanel'
import { SanctionsTablePanel } from './panels/SanctionsTablePanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { GaugePanel } from './panels/GaugePanel'
import { TopAccountsPanel } from './panels/TopAccountsPanel'
import { HeatmapPanel } from './panels/HeatmapPanel'
import { ModelInfoPanel } from './panels/ModelInfoPanel'
import { WashTradingHyperparameters, FundingFeeHyperparameters, CooperativeHyperparameters, DetectionType, SanctionCase, TopAccount } from '../types'

interface DashboardProps {
    data: {
        totalDetections: number
        washTradingDetections: number

        fundingFeeDetections: number
        cooperativeDetections: number
        timeSeriesData: {
            time: number
            [DetectionType.WashTrading]: number
            [DetectionType.FundingFee]: number
            [DetectionType.Cooperative]: number
        }[]
        sanctions: SanctionCase[]
        topFundingFeeAccounts: TopAccount[]
        hourlyDistribution: { [hour: number]: number }
    }
    hyperparameters: {
        wash: WashTradingHyperparameters
        funding: FundingFeeHyperparameters
        coop: CooperativeHyperparameters
    }
    onWashParamsChange: (params: WashTradingHyperparameters) => void
    onFundingParamsChange: (params: FundingFeeHyperparameters) => void
    onCoopParamsChange: (params: CooperativeHyperparameters) => void
    onSelectDetail: (item: any, type: 'sanction' | 'account') => void
    onOpenModelInfo: () => void
    washTradingPairs?: Array<{ pair_id: string; winner_account: string }>
}

const Dashboard: React.FC<DashboardProps> = ({
    data,
    hyperparameters,
    onWashParamsChange,
    onFundingParamsChange,
    onCoopParamsChange,
    onSelectDetail,
    onOpenModelInfo,
    washTradingPairs = [],
}) => {
    const totalRiskScore =
        (data.washTradingDetections * 1.5 + data.fundingFeeDetections * 1.2 + data.cooperativeDetections * 1.0) / (data.totalDetections || 1)
    const normalizedRisk = Math.min(100, Math.max(0, totalRiskScore * 10))

    return (
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
            <div className="col-span-12 lg:col-span-3">
                <StatPanel title="총 탐지 건수" value={data.totalDetections.toLocaleString()} />
            </div>
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <StatPanel title="자금세탁 (Wash Trading)" value={data.washTradingDetections.toLocaleString()} />
            </div>
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <StatPanel title="펀딩비 악용 (Funding Fee)" value={data.fundingFeeDetections.toLocaleString()} />
            </div>
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <StatPanel title="공모 거래 (Cooperative)" value={data.cooperativeDetections.toLocaleString()} />
            </div>

            <div className="col-span-12 lg:col-span-9 h-96">
                <TimeSeriesPanel title="시간별 탐지 추이" data={data.timeSeriesData} />
            </div>

            <div className="col-span-12 lg:col-span-3 h-96">
                <GaugePanel title="종합 위험도 점수" value={normalizedRisk} />
            </div>

            <div className="col-span-12 lg:col-span-7 h-96">
                <SanctionsTablePanel title="실시간 제재 현황" sanctions={data.sanctions} onSelectSanction={(s) => onSelectDetail(s, 'sanction')} />
            </div>

            <div className="col-span-12 lg:col-span-5 h-96">
                <TopAccountsPanel
                    allSanctions={data.sanctions}
                    onSelectAccount={(a) => onSelectDetail(a, 'account')}
                    washTradingPairs={washTradingPairs}
                />
            </div>

            <div className="col-span-12 lg:col-span-5 h-96">
                <HeatmapPanel title="시간대별 탐지 집중도" data={data.hourlyDistribution} />
            </div>

            <div className="col-span-12 lg:col-span-4 h-96">
                <SettingsPanel
                    hyperparameters={hyperparameters}
                    onWashParamsChange={onWashParamsChange}
                    onFundingParamsChange={onFundingParamsChange}
                    onCoopParamsChange={onCoopParamsChange}
                />
            </div>

            <div className="col-span-12 lg:col-span-3 h-96">
                <ModelInfoPanel onOpen={onOpenModelInfo} />
            </div>
        </div>
    )
}

export default Dashboard
