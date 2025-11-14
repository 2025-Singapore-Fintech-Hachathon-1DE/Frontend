
import React from 'react';
import { WashTradingHyperparameters, FundingFeeHyperparameters, CooperativeHyperparameters } from '../../types';

interface SettingsPanelProps {
  hyperparameters: {
    wash: WashTradingHyperparameters;
    funding: FundingFeeHyperparameters;
    coop: CooperativeHyperparameters;
  };
  onWashParamsChange: (params: WashTradingHyperparameters) => void;
  onFundingParamsChange: (params: FundingFeeHyperparameters) => void;
  onCoopParamsChange: (params: CooperativeHyperparameters) => void;
}

const Slider: React.FC<{label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (value: number) => void}> = 
  ({ label, value, min, max, step, unit, onChange }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm text-blue-400 font-mono w-16 text-right">{value}{unit}</span>
    </div>
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  hyperparameters,
  onWashParamsChange,
  onFundingParamsChange,
  onCoopParamsChange,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col border border-gray-700">
      <h3 className="text-md font-semibold text-white mb-4">하이퍼파라미터 튜닝</h3>
      <div className="flex-grow overflow-y-auto pr-2">
        <div className="mb-4">
          <h4 className="font-semibold text-blue-400 mb-2 border-b border-gray-600 pb-1">자금세탁 (Wash Trading)</h4>
          <Slider label="봇 탐지 임계값" value={hyperparameters.wash.bot_tier_threshold} min={70} max={100} step={1} unit="" onChange={v => onWashParamsChange({...hyperparameters.wash, bot_tier_threshold: v})} />
          <Slider label="의심 거래 임계값" value={hyperparameters.wash.suspicious_threshold} min={30} max={70} step={1} unit="" onChange={v => onWashParamsChange({...hyperparameters.wash, suspicious_threshold: v})} />
        </div>
        <div className="mb-4">
          <h4 className="font-semibold text-green-400 mb-2 border-b border-gray-600 pb-1">펀딩비 악용 (Funding Fee)</h4>
          <Slider label="Critical 임계값" value={hyperparameters.funding.critical_threshold} min={70} max={100} step={1} unit="" onChange={v => onFundingParamsChange({...hyperparameters.funding, critical_threshold: v})} />
          <Slider label="최대 보유 시간(분)" value={hyperparameters.funding.max_holding_minutes} min={5} max={60} step={1} unit="분" onChange={v => onFundingParamsChange({...hyperparameters.funding, max_holding_minutes: v})} />
        </div>
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2 border-b border-gray-600 pb-1">공모 거래 (Cooperative)</h4>
          <Slider label="Critical 임계값" value={hyperparameters.coop.critical_threshold} min={70} max={100} step={1} unit="" onChange={v => onCoopParamsChange({...hyperparameters.coop, critical_threshold: v})} />
          <Slider label="최소 공유 IP 수" value={hyperparameters.coop.min_shared_ips} min={1} max={5} step={1} unit="개" onChange={v => onCoopParamsChange({...hyperparameters.coop, min_shared_ips: v})} />
        </div>
      </div>
    </div>
  );
};
