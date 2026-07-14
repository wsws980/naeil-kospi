import { PredictionLevel, ComingSoonItem } from "./types";

export interface LevelMeta {
  level: PredictionLevel;
  emoji: string;
  label: string;
  shortLabel: string;
  /** 게이지에서 사용하는 존 색상 (CSS 변수명) */
  color: string;
  /** 텍스트/배지 등에 쓰는 색상 */
  textColor: string;
  bgColor: string;
  description: string;
}

export const LEVEL_META: Record<PredictionLevel, LevelMeta> = {
  strong_up: {
    level: "strong_up",
    emoji: "🚀",
    label: "강한 상승",
    shortLabel: "강한 상승",
    color: "var(--level-strong-up)",
    textColor: "var(--level-strong-up)",
    bgColor: "var(--level-strong-up-bg)",
    description: "다음 거래일 코스피 시가가 강하게 갭상승 출발할 것으로 예측",
  },
  up: {
    level: "up",
    emoji: "🟢",
    label: "상승",
    shortLabel: "상승",
    color: "var(--level-up)",
    textColor: "var(--level-up)",
    bgColor: "var(--level-up-bg)",
    description: "다음 거래일 코스피 시가가 소폭 갭상승 출발할 것으로 예측",
  },
  flat: {
    level: "flat",
    emoji: "🟡",
    label: "보합",
    shortLabel: "보합",
    color: "var(--level-flat)",
    textColor: "var(--level-flat)",
    bgColor: "var(--level-flat-bg)",
    description: "다음 거래일 코스피 시가가 전일 종가 부근에서 출발할 것으로 예측",
  },
  down: {
    level: "down",
    emoji: "🔴",
    label: "하락",
    shortLabel: "하락",
    color: "var(--level-down)",
    textColor: "var(--level-down)",
    bgColor: "var(--level-down-bg)",
    description: "다음 거래일 코스피 시가가 소폭 갭하락 출발할 것으로 예측",
  },
  strong_down: {
    level: "strong_down",
    emoji: "⬇️",
    label: "강한 하락",
    shortLabel: "강한 하락",
    color: "var(--level-strong-down)",
    textColor: "var(--level-strong-down)",
    bgColor: "var(--level-strong-down-bg)",
    description: "다음 거래일 코스피 시가가 강하게 갭하락 출발할 것으로 예측",
  },
};

/** 게이지에서 왼쪽(하락)→오른쪽(상승) 순서 */
export const GAUGE_ORDER: PredictionLevel[] = [
  "strong_down",
  "down",
  "flat",
  "up",
  "strong_up",
];

export const COMING_SOON_ITEMS: ComingSoonItem[] = [
  { id: "kosdaq", label: "코스닥", emoji: "📊" },
  { id: "nasdaq", label: "나스닥", emoji: "💻" },
  { id: "sp500", label: "S&P500", emoji: "🇺🇸" },
  { id: "usdkrw", label: "달러/원", emoji: "💱" },
  { id: "us_futures", label: "미국 선물", emoji: "📈" },
  { id: "vix", label: "VIX", emoji: "⚡" },
  { id: "econ_calendar", label: "경제 일정", emoji: "🗓️" },
];
