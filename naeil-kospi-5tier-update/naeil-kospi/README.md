# 내일 코스피 (Naeil KOSPI)

매일 장 마감 후, **다음 거래일 코스피 시가**가 5단계(🚀 강한 상승 / 🟢 상승 / 🟡 보합 / 🔴 하락 / ⬇️ 강한 하락) 중 어디에 해당할지 보여주는 서비스입니다.

- 종가나 장중 흐름이 아니라 **다음 거래일 "시가"** 만을 다룹니다.
- 예측 값은 관리자가 직접 입력하며, 예측 알고리즘/AI 모델은 아직 연결되어 있지 않습니다. (`lib/db.ts`의 `source: "manual" | "model"` 필드로 나중에 쉽게 확장 가능하도록 분리해두었습니다.)

## 기술 스택

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- 데이터 저장: JSON 파일 (`data/store.json`) — 별도 DB 설정 없이 바로 운영 가능
- 인증: 비밀번호 1개 + HMAC 서명 세션 쿠키 (자체 구현, 외부 서비스 의존 없음)

## 폴더 구조

```
app/
  page.tsx                 메인 페이지 (서버 컴포넌트)
  layout.tsx                루트 레이아웃 (SEO 메타데이터, 폰트, 다크모드 FOUC 방지)
  globals.css                디자인 토큰(CSS 변수) + 폰트
  admin/
    page.tsx                 관리자 로그인
    dashboard/page.tsx        관리자 대시보드 (미들웨어로 보호됨)
  api/
    prediction/route.ts       내일 예측 GET/POST
    history/route.ts          과거 예측 GET/POST/DELETE
    accuracy/route.ts         적중률 GET/PUT(수동수정)/POST(자동계산)
    ads/route.ts               광고 슬롯 GET/PUT(이미지 업로드 포함)
    auth/route.ts               로그인/로그아웃
components/
  MainPredictionCard.tsx      메인 예측 카드
  PredictionGauge.tsx          5단계 게이지 시각화 (시그니처 컴포넌트)
  AccuracyStats.tsx             적중률 3종 카드
  HistoryTable.tsx               과거 예측 테이블
  AdSlot.tsx                      광고 영역 (배너 없으면 AdSense 삽입용 빈 컨테이너)
  ComingSoonGrid.tsx              Coming Soon 카드
  admin/                          관리자 전용 폼들
lib/
  types.ts                    핵심 타입 정의
  db.ts                        데이터 접근 계층 (나중에 실제 DB로 교체 시 이 파일만 수정)
  auth.ts                       인증 로직
  constants.ts                   5단계 라벨/색상/이모지 등 메타데이터
  format.ts                       날짜/시간 포맷 유틸
data/store.json                초기 시드 데이터 (더미 45일치 히스토리 포함)
proxy.ts                      관리자 대시보드 보호 (Next.js 16의 미들웨어 → 프록시)
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD, ADMIN_SESSION_SECRET 값을 채워주세요
npm run dev
```

- 메인 페이지: http://localhost:3000
- 관리자: http://localhost:3000/admin (비밀번호는 `.env.local`의 `ADMIN_PASSWORD`)

## 배포 시 주의사항 (중요)

현재 데이터 저장 방식은 **서버의 로컬 파일(`data/store.json`, `public/uploads/`)에 직접 씁니다.**

- **정상 동작하는 환경**: 자체 VPS, Docker 컨테이너, Railway/Render 같은 "항상 켜져 있는 단일 서버" 환경 (`npm run build && npm run start`)
- **주의가 필요한 환경**: Vercel 등 서버리스/엣지 배포 — 배포마다 파일시스템이 초기화되고 인스턴스 간 파일이 공유되지 않아 관리자가 저장한 값이 유지되지 않습니다.

Vercel 등 서버리스 환경에 배포하고 싶다면 `lib/db.ts`의 함수 시그니처(`getCurrentPrediction`, `setCurrentPrediction`, `getHistory` 등)는 그대로 두고 내부 구현만 Supabase/PlanetScale/Postgres 등으로 교체하면 됩니다. 나머지 코드(컴포넌트, API 라우트)는 전혀 수정할 필요가 없습니다.

## 광고 붙이는 법

세 광고 영역(① 메인 결과 아래 ② 적중률 아래 ③ 페이지 하단)은 관리자 페이지 → **광고 관리** 탭에서 이미지+링크를 등록하면 바로 반영됩니다.

광고주 배너가 없을 때는 `components/AdSlot.tsx`가 `<div id="adsense-slot-ad1">` 같은 빈 컨테이너를 렌더링합니다. Google AdSense 심사를 통과한 뒤, 이 컴포넌트 안의 주석 처리된 `<ins className="adsbygoogle" ... />` 코드의 주석을 풀고 발급받은 `data-ad-client` / `data-ad-slot` 값만 넣으면 됩니다.

## 적중률 계산 방식

- 히스토리에 `actual`(실제 결과) 값이 입력된 건들만 집계 대상입니다.
- "과거 예측 추가" 후 자동으로 최근 7/30/100일 적중률이 재계산됩니다.
- 관리자 페이지 "적중률" 탭에서 값을 수동으로 덮어쓸 수도 있고, "과거 예측에서 자동 계산" 버튼으로 다시 자동 계산 값으로 되돌릴 수도 있습니다.

## 다음 단계 (예측 알고리즘 연결)

`lib/db.ts`의 `setCurrentPrediction`을 호출하는 주체를 관리자 수동 입력 대신 스케줄러(cron)나 AI 모델 서버로 바꾸면 됩니다. `CurrentPrediction.source` 필드가 이미 `"manual" | "model"`로 분리되어 있어, 자동화 이후에도 메인 화면 UI는 수정할 필요가 없습니다.
