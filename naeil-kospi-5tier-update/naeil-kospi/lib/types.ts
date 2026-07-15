/**
 * 내일 코스피 — 핵심 타입 정의
 * 예측 알고리즘이 나중에 연결되더라도 이 타입들은 그대로 재사용됩니다.
 */

/** 다음 거래일 코스피 "시가" 예측 5단계
 *  상승 / 보합(상승) / 예측패스 / 보합(하락) / 하락
 *  - "up_mild"(보합-상승)와 "up"은 둘 다 "상승" 방향에 베팅한 것으로 취급되고,
 *    "down_mild"(보합-하락)와 "down"은 둘 다 "하락" 방향에 베팅한 것으로 취급됩니다.
 *  - "pass"는 방향성 판단이 애매할 때 예측 자체를 보류(패스)하는 상태로,
 *    적중률 집계에서 완전히 제외됩니다.
 */
export type PredictionLevel = "up" | "up_mild" | "pass" | "down_mild" | "down";

export const PREDICTION_LEVELS: PredictionLevel[] = [
  "up",
  "up_mild",
  "pass",
  "down_mild",
  "down",
];

/**
 * 실제 시장 결과는 "다음 거래일 시가가 전일 종가 대비 플러스였는지 마이너스였는지"
 * 딱 둘로만 판정합니다 (0% 이상 = up, 마이너스 = down). "보합"이나 "패스"는
 * 실제 결과로 존재할 수 없습니다.
 */
export type ActualResult = "up" | "down";

export const ACTUAL_RESULTS: ActualResult[] = ["up", "down"];

/** 현재 메인 화면에 노출되는 "내일 시가 예측" */
export interface CurrentPrediction {
  level: PredictionLevel;
  /** 관리자가 남기는 짧은 코멘트 (선택) */
  note?: string;
  /** ISO 문자열 */
  updatedAt: string;
  /** 이 예측이 어떤 방식으로 산출되었는지 — 지금은 항상 manual */
  source: "manual" | "model";
}

/** 과거 예측 1건 (히스토리 테이블 + 적중률 계산의 기반 데이터) */
export interface HistoryEntry {
  id: string;
  /** 예측 대상 거래일 (YYYY-MM-DD), 즉 "다음 거래일" */
  date: string;
  predicted: PredictionLevel;
  /** 실제 결과는 장 시작 후 입력되므로 없을 수도 있음 */
  /** 실제 시장 결과는 상승/하락 둘 중 하나로만 판정 (보합·패스는 없음) */
  actual: ActualResult | null;
  /** 적중 여부 — actual이 없으면 null */
  isHit: boolean | null;
}

export type AccuracyPeriod = 7 | 30 | 100;

export interface AccuracyStat {
  period: AccuracyPeriod;
  hitRate: number; // 0~100
  hitCount: number;
  totalCount: number;
  /** true면 관리자가 수동으로 값을 덮어쓴 것, false면 히스토리에서 자동 계산 */
  isManualOverride: boolean;
  updatedAt: string;
}

export interface AdSlotData {
  id: "ad1" | "ad2" | "ad3";
  label: string;
  imageUrl: string | null;
  linkUrl: string | null;
  /** 배너가 없을 때 AdSense 등 다른 광고 코드를 넣을 수 있도록 하는 스위치 */
  enabled: boolean;
  updatedAt: string;
}

export interface ComingSoonItem {
  id: string;
  label: string;
  emoji: string;
}

/** 전체 저장소 스키마 (JSON 파일 1개로 관리) */
export interface StoreSchema {
  currentPrediction: CurrentPrediction;
  history: HistoryEntry[];
  accuracy: Record<AccuracyPeriod, AccuracyStat>;
  ads: AdSlotData[];
}
