/**
 * 내일 코스피 — 핵심 타입 정의
 * 예측 알고리즘이 나중에 연결되더라도 이 타입들은 그대로 재사용됩니다.
 */

/** 다음 거래일 코스피 "시가" 예측 5단계 */
export type PredictionLevel =
  | "strong_up" // 🚀 강한 상승
  | "up" // 🟢 상승
  | "flat" // 🟡 보합
  | "down" // 🔴 하락
  | "strong_down"; // ⬇️ 강한 하락

export const PREDICTION_LEVELS: PredictionLevel[] = [
  "strong_up",
  "up",
  "flat",
  "down",
  "strong_down",
];

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
  actual: PredictionLevel | null;
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
