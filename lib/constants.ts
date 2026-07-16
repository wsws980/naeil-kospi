import { PredictionLevel, ActualResult, ComingSoonItem } from "./types";

export interface LevelMeta {
  level: PredictionLevel;
  emoji: string;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  bgColor: string;
  /** 메인 화면(오늘의 예측)에서 쓰는 설명 문구 */
  description: string;
}

export const LEVEL_META: Record<PredictionLevel, LevelMeta> = {
  up: {
    level: "up",
    emoji: "🚀",
    label: "강한상승",
    shortLabel: "강한상승",
    color: "var(--level-strong-up)",
    textColor: "var(--level-strong-up)",
    bgColor: "var(--level-strong-up-bg)",
    description: "다음 거래일 코스피 시가가 강하게 갭상승 출발할 것으로 예측",
  },
  up_mild: {
    level: "up_mild",
    emoji: "🔴",
    label: "상승",
    shortLabel: "상승",
    color: "var(--level-up)",
    textColor: "var(--level-up)",
    bgColor: "var(--level-up-bg)",
    description: "다음 거래일 코스피 시가가 소폭 갭상승 또는 보합권 상단에서 출발할 것으로 예측",
  },
  pass: {
    level: "pass",
    emoji: "👀",
    label: "관망",
    shortLabel: "관망",
    color: "var(--level-flat)",
    textColor: "var(--level-flat)",
    bgColor: "var(--level-flat-bg)",
    description: "오늘은 방향성 판단이 애매해 관망합니다 (적중률 집계에서 제외)",
  },
  down_mild: {
    level: "down_mild",
    emoji: "🔵",
    label: "하락",
    shortLabel: "하락",
    color: "var(--level-down)",
    textColor: "var(--level-down)",
    bgColor: "var(--level-down-bg)",
    description: "다음 거래일 코스피 시가가 소폭 갭하락 또는 보합권 하단에서 출발할 것으로 예측",
  },
  down: {
    level: "down",
    // 파란 아래 화살표: 순수 텍스트 글리프라 CSS color(textColor)를 그대로 물려받아 파란색으로 보입니다.
    emoji: "↓",
    label: "강한하락",
    shortLabel: "강한하락",
    color: "var(--level-strong-down)",
    textColor: "var(--level-strong-down)",
    bgColor: "var(--level-strong-down-bg)",
    description: "다음 거래일 코스피 시가가 강하게 갭하락 출발할 것으로 예측",
  },
};

/** 게이지에서 왼쪽(하락)→오른쪽(상승) 순서 */
export const GAUGE_ORDER: PredictionLevel[] = ["down", "down_mild", "pass", "up_mild", "up"];

/**
 * "실제 결과"는 상승/하락 2가지뿐이라 예측용 5단계 라벨(강한상승/강한하락 등)을
 * 그대로 쓰면 어색합니다. up_mild/down_mild의 라벨("상승"/"하락")을 재사용합니다.
 */
export const ACTUAL_META: Record<ActualResult, LevelMeta> = {
  up: LEVEL_META.up_mild,
  down: LEVEL_META.down_mild,
};

export const COMING_SOON_ITEMS: ComingSoonItem[] = [
  { id: "kosdaq", label: "코스닥", emoji: "📊" },
  { id: "nasdaq", label: "나스닥", emoji: "💻" },
  { id: "sp500", label: "S&P500", emoji: "🇺🇸" },
  { id: "usdkrw", label: "달러/원", emoji: "💱" },
  { id: "us_futures", label: "미국 선물", emoji: "📈" },
  { id: "vix", label: "VIX", emoji: "⚡" },
  { id: "econ_calendar", label: "경제 일정", emoji: "🗓️" },
];
