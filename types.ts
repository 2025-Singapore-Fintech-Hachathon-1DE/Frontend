
export enum DetectionType {
  WashTrading = 'WASH_TRADING',
  FundingFee = 'FUNDING_FEE',
  Cooperative = 'COOPERATIVE',
}

export interface SimulationEvent {
  timestamp: number;
  type: DetectionType;
  data: any;
  id: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'sanction' | 'alert';
  message: string;
}

export interface WashTradingHyperparameters {
  concurrency_threshold_sec: number;
  quantity_tolerance_pct: number;
  bot_tier_threshold: number;
  manual_tier_threshold: number;
  suspicious_threshold: number;
}

export interface FundingFeeHyperparameters {
  min_leverage: number;
  max_holding_minutes: number;
  critical_threshold: number;
  high_threshold: number;
}

export interface CooperativeHyperparameters {
  max_open_time_diff_min: number;
  critical_threshold: number;
  high_threshold: number;
  min_shared_ips: number;
}

export interface SanctionCase {
  id: string;
  model: 'wash' | 'funding' | 'cooperative';
  timestamp: number;
  type: string;
  accounts: string[];
  details: string;
  score: number;
  launderedAmount?: number;
  tradePairIds?: string[];
  raw: any; // 원본 데이터 저장
}

export interface TopAccount {
  account_id: string;
  total_cases: number;
  total_profit_loss: number;
  profits: {
      funding: number;
      wash: number;
      cooperative: number;
  };
  avg_score: number;
  max_score: number;
  critical_count: number;
  high_count: number;
}


export interface DetailData {
    type: 'sanction' | 'account';
    data: SanctionCase | TopAccount;
}

export interface Trade {
    trade_id: string;
    account_id: string;
    timestamp: number;
    symbol: string;
    side: 'LONG' | 'SHORT';
    position_id: string;
    leverage: number;
    price: number;
    quantity: number;
    amount: number;
}

export interface GraphNode {
    id: string;
    x: number;
    y: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    amount: number;
    score: number;
}