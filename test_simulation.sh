#!/bin/bash

# 시뮬레이션 API 테스트 스크립트
API_URL="http://localhost:8000/api/simulation"

echo "=========================================="
echo "시뮬레이션 API 통합 테스트"
echo "=========================================="
echo ""

# 1. 상태 확인
echo "1. 시뮬레이션 상태 확인..."
curl -s -X GET "${API_URL}/status" | jq '.'
echo ""
echo ""

# 2. 1일 진행
echo "2. 시뮬레이션 1일 진행..."
curl -s -X POST "${API_URL}/advance" \
  -H "Content-Type: application/json" \
  -d '{"days": 1, "hours": 0}' | jq '.'
echo ""
echo ""

# 3. 상태 재확인
echo "3. 진행 후 상태 확인..."
curl -s -X GET "${API_URL}/status" | jq '.'
echo ""
echo ""

# 4. 7일 진행
echo "4. 시뮬레이션 7일 진행..."
curl -s -X POST "${API_URL}/advance" \
  -H "Content-Type: application/json" \
  -d '{"days": 7, "hours": 0}' | jq '.'
echo ""
echo ""

# 5. 상태 확인
echo "5. 진행 후 상태 확인..."
curl -s -X GET "${API_URL}/status" | jq '.'
echo ""
echo ""

# 6. 리셋
echo "6. 시뮬레이션 리셋..."
curl -s -X POST "${API_URL}/reset" | jq '.'
echo ""
echo ""

# 7. 리셋 후 상태 확인
echo "7. 리셋 후 상태 확인..."
curl -s -X GET "${API_URL}/status" | jq '.'
echo ""
echo ""

echo "=========================================="
echo "테스트 완료!"
echo "=========================================="
