# Singapore Detection System - Frontend

부정거래 탐지 시스템 프론트엔드 대시보드

## 변경사항

### API 통합 완료 ✅

이전에는 목업(mock) 데이터를 사용했지만, 이제 실제 백엔드 API와 연결되어 있습니다.

#### 변경된 파일

1. **`api/client.ts`** (신규)

    - 백엔드 API 호출을 위한 클라이언트 함수들
    - 모든 엔드포인트 래핑

2. **`hooks/useApiData.ts`** (신규)

    - 실제 API 데이터를 가져오는 훅
    - 로딩, 에러 상태 관리

3. **`App.tsx`** (수정)

    - `useSimulation` 대신 `useApiData` 사용
    - 로딩 화면 및 에러 처리 추가

4. **`vite-env.d.ts`** (신규)
    - TypeScript 환경 변수 타입 정의

## 사용 방법

### 1. 백엔드 서버 시작

```bash
cd ../Singapore_back
./start_server.sh
# 또는
source venv/bin/activate && python main.py
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

### 2. 프론트엔드 개발 서버 시작

```bash
npm install  # 최초 1회만
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 3. 브라우저에서 확인

http://localhost:5173 접속

## 데이터 흐름

```
1. 프론트엔드 시작
   ↓
2. useApiData 훅이 백엔드 API 호출
   ↓
3. 백엔드가 탐지 결과 데이터 반환
   ↓
4. 프론트엔드가 데이터를 시각화
```

## API 엔드포인트

프론트엔드는 다음 API를 사용합니다:

-   `GET /api/stats` - 전체 탐지 통계
-   `GET /api/sanctions` - 제재 케이스 리스트
-   `GET /api/timeseries` - 시간별 탐지 추이
-   `GET /api/top-accounts` - 상위 위반 계정
-   `GET /api/hourly-distribution` - 시간대별 분포

## 환경 변수

`.env` 파일을 생성하여 API URL을 설정할 수 있습니다:

```env
VITE_API_URL=http://localhost:8000
```

기본값은 `http://localhost:8000`입니다.

## 기능

### 실시간 데이터 시각화

-   **통계 패널**: 전체 탐지 건수, 모델별 탐지 건수
-   **시계열 차트**: 시간별 탐지 추이
-   **게이지 차트**: 종합 위험도 점수
-   **제재 테이블**: 실시간 제재 현황
-   **상위 계정**: 위반 계정 순위
-   **히트맵**: 시간대별 탐지 집중도

### 상세 정보 모달

-   제재 케이스 상세
-   계정 상세 정보
-   관련 거래 내역

### 모델 정보

-   Bonus Laundering (증정금 녹이기)
-   Funding Fee Hunter (펀딩비 악용)
-   Cooperative Trading (공모거래)

## 개발

### 프로젝트 구조

```
Singapore_front/
├── api/
│   └── client.ts          # API 클라이언트
├── hooks/
│   ├── useApiData.ts      # API 데이터 훅 (실제 사용)
│   └── useSimulation.ts   # 시뮬레이션 훅 (레거시)
├── components/
│   ├── Dashboard.tsx
│   ├── DetailModal.tsx
│   └── panels/
│       ├── StatPanel.tsx
│       ├── TimeSeriesPanel.tsx
│       └── ...
└── App.tsx                # 메인 앱
```

### 목업 데이터에서 실제 데이터로 전환

이전 코드 (목업 데이터):

```tsx
const simulation = useSimulation(generateLogs, hyperparameters)
;<Dashboard data={simulation.dataForDashboard} />
```

현재 코드 (실제 API):

```tsx
const apiData = useApiData()
;<Dashboard data={dashboardData} />
```

## 문제 해결

### CORS 에러

백엔드 서버가 실행 중인지 확인:

```bash
curl http://localhost:8000/health
```

### 데이터가 로드되지 않음

1. 백엔드 서버 확인
2. 브라우저 개발자 도구 확인 (Network 탭)
3. 콘솔 에러 확인

### 로딩이 계속됨

백엔드 로그 확인:

```bash
# Singapore_back 폴더에서
tail -f api.log
```

## 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 환경 변수 설정

프로덕션 환경에서는 `.env.production` 파일을 생성:

```env
VITE_API_URL=https://your-api-server.com
```

## 라이센스

Singapore Fintech Hackathon 2025
