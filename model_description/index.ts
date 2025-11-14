export const washTradingModelInfo = `
# 증정금 녹이기 탐지 시스템 v2.0

보너스 증정금을 악용한 무위험 현금화(Bonus Laundering) 행위를 탐지하는 2-Tier 시스템입니다.

## 🎯 주요 기능

### 2-Tier 탐지 시스템

#### Tier 1: Bot 기반 악의적 거래

-   **특징**: 완벽한 타이밍, 수량, 레버리지 매칭
-   **점수**: 90점 이상
-   **처리**: 즉시 제재 파이프라인 전송

#### Tier 2: 수동 기반 악의적 거래

-   **특징**: 느슨한 매칭이지만 증정금 녹이기 패턴 존재
-   **점수**: 70-89점
-   **처리**: 수익 계정 추적 및 네트워킹 분석
    -   동일 수익 계정 2회 이상 등장 → 제재
    -   A→B→C 형태 연결 체인 발견 → 제재

## 📊 탐지 프로세스

### Phase 1: Filter (필수 조건 선별)

| 지표             | 조건         | 설명                                |
| ---------------- | ------------ | ----------------------------------- |
| Time Since Bonus | 72시간 이내  | 보너스 수령 후 거래 개시까지의 시간 |
| Reverse Position | Long ↔ Short | 반대 방향 포지션                    |
| Equal Leverage   | 완전 동일    | 레버리지 배율 일치                  |
| Concurrency      | 30초 이내    | 거래 시간 동기화                    |
| Quantity Match   | ±2% 이내     | 거래 수량 근접성                    |

### Phase 2: Scoring (점수화)

| 지표                | 배점 | 설명                                |
| ------------------- | ---- | ----------------------------------- |
| P&L Mirroring       | 40점 | 손익 대칭성 (PnL_A + PnL_B ≈ 0)     |
| High Concurrency    | 25점 | 시간 근접도 (0초에 가까울수록 높음) |
| High Quantity Match | 20점 | 수량 일치도 (0%에 가까울수록 높음)  |
| Trade Value Ratio   | 15점 | 보너스 대비 거래액 비율             |

**총점 100점 만점**

### Tier 분류

-   **Bot (90점 이상)**: 즉시 제재
-   **Manual (70-89점)**: 네트워킹 분석
-   **Suspicious (50-69점)**: 모니터링
-   **Normal (50점 미만)**: 정상 거래

## 🚀 사용법

### 기본 실행

\`\`\`python
from newWashTrading import run_detection

result = run_detection(data_filepath="problem_data_final.xlsx")
\`\`\`

### 커스텀 설정

\`\`\`python
from newWashTrading import run_detection, DetectionConfig

# 설정 커스터마이즈
config = DetectionConfig(
    # Filter 파라미터
    time_since_bonus_hours=72.0,      # 보너스 후 시간 창
    concurrency_threshold_sec=30.0,    # 동시성 임계값
    quantity_tolerance_pct=0.02,       # 수량 허용 오차 (2%)

    # Tier 임계값
    bot_tier_threshold=90,             # Bot 판정 점수
    manual_tier_threshold=70,          # Manual 판정 점수

    # 네트워크 파라미터
    min_profit_occurrences=2,          # 제재 대상 최소 수익 횟수

    # 출력 설정
    output_dir="./output/bonus",
    enable_detailed_logging=True
)

result = run_detection(
    data_filepath="problem_data_final.xlsx",
    config=config
)
\`\`\`
`;

export const fundingFeeModelInfo = `
# Funding Hunter Detection System

펀딩비 악용 탐지 시스템 v2.0

## 개요

펀딩비 정산 시점을 노린 고빈도 포지션 개폐 패턴을 탐지합니다.

## 주요 기능

### 1. 탐지 알고리즘

-   **필수 조건 필터링**: 레버리지, 거래량, 보유시간, 시간대 변경
-   **4차원 점수 시스템**:
    -   펀딩비 수익 (40점)
    -   짧은 보유 시간 (25점)
    -   높은 레버리지 (20점)
    -   큰 포지션 크기 (15점)
-   **심각도 분류**: CRITICAL / HIGH / MEDIUM / LOW

### 2. 탐지 기준

#### 필수 조건

-   레버리지 ≥ 5배
-   거래량 ≥ 최대 주문량의 30%
-   보유 시간 ≤ 20분
-   펀딩비 정산 시점에 클로징
-   오픈/클로즈 시간대 변경 필수

#### 심각도 임계값

-   **CRITICAL**: 85점 이상
-   **HIGH**: 70점 이상
-   **MEDIUM**: 50점 이상
-   **LOW**: 50점 미만

## 결과 해석

### 점수 체계

#### 펀딩비 수익 (40점)

-   $1,000 이상: 40점
-   $500-1,000: 34점
-   $200-500: 26점
-   $100-200: 18점

#### 보유 시간 (25점)

-   ≤ 5분: 25점
-   5-10분: 20점
-   10-15분: 15점
-   15-20분: 9점

#### 레버리지 (20점)

-   ≥ 20배: 20점
-   15-20배: 16점
-   10-15배: 12점
-   5-10배: 7점

#### 포지션 크기 (15점)

-   ≥ 80%: 15점
-   60-80%: 11점
-   50-60%: 8점
-   30-50%: 4점
`;

export const cooperativeModelInfo = `
# Cooperative Trading Detection System

공모거래 탐지 시스템 v2.0

## 개요

복수 계정 간 협력하여 부당 이득을 취하는 패턴을 탐지합니다.

## 주요 기능

### 1. 탐지 알고리즘

-   **필수 조건 필터링**: 시간 동시성, 동일 심볼, 주요 코인 제외
-   **4차원 점수 시스템**:
    -   PnL 비대칭성 (35점) - 한쪽만 큰 이익
    -   시간 근접도 (25점)
    -   IP 공유 (25점)
    -   포지션 겹침 (15점)
-   **위험도 분류**: CRITICAL / HIGH / MEDIUM / LOW
-   **네트워크 분석**: 연결된 계정 그룹 탐지

### 2. 탐지 기준

#### 필수 조건

-   오픈 시간차 ≤ 2분
-   클로즈 시간차 ≤ 2분
-   동일 심볼에서 거래
-   동일 사이드 (LONG/SHORT)
-   포지션 시간 겹침
-   주요 심볼 제외 (BTC, ETH, SOL, XRP, BNB, DOGE)

#### 위험도 임계값

-   **CRITICAL**: 85점 이상
-   **HIGH**: 70점 이상
-   **MEDIUM**: 50점 이상
-   **LOW**: 50점 미만

## 결과 해석

### 점수 체계

#### PnL 비대칭성 (35점)

한쪽이 큰 이익을 보는 정도

-   ≥ 80% 비대칭: 35점
-   60-80%: 26점
-   40-60%: 18점
-   20-40%: 9점

#### 시간 근접도 (25점)

오픈/클로즈 평균 시간차

-   ≤ 5초: 25점
-   5-15초: 20점
-   15-30초: 15점
-   30-60초: 10점
-   60-120초: 5점

#### IP 공유 (25점)

두 계정 간 공유 IP 개수

-   ≥ 5개: 25점
-   3-4개: 20점
-   2개: 15점
-   1개: 10점

#### 포지션 겹침 (15점)

포지션 보유 시간 겹침 비율

-   ≥ 90%: 15점
-   70-90%: 11점
-   50-70%: 8점
-   < 50%: 4점

## 네트워크 분석

### Union-Find 알고리즘

-   거래 쌍에서 연결된 계정 그룹 탐지
-   A↔B, B↔C → {A, B, C} 그룹으로 병합

### 그룹 위험도 분류

-   평균 점수 + (공유 IP 수 × 5)
-   IP 공유가 많을수록 위험도 상승

### 제재 기준

-   Critical 그룹: 즉시 제재
-   High + IP 공유 1개 이상: 제재 대상
`;
