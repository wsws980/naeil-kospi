import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  StoreSchema,
  CurrentPrediction,
  HistoryEntry,
  AccuracyStat,
  AccuracyPeriod,
  AdSlotData,
  PredictionLevel,
  ActualResult,
} from "./types";

/**
 * 예측값이 실제로 어느 "방향"에 베팅한 것인지 판정합니다.
 * - up, up_mild(보합-상승) → "up" 방향
 * - down, down_mild(보합-하락) → "down" 방향
 * - pass(관망) → 방향 없음(null) → 적중률 집계에서 제외
 */
function predictedDirection(predicted: PredictionLevel): ActualResult | null {
  if (predicted === "up" || predicted === "up_mild") return "up";
  if (predicted === "down" || predicted === "down_mild") return "down";
  return null;
}

/**
 * 데이터 저장소 (Supabase Postgres)
 * ------------------------------------------------------------------
 * 전체 상태(StoreSchema)를 app_store 테이블의 단일 행(id=1)에 JSONB로 저장합니다.
 * 재배포해도 데이터가 사라지지 않습니다 (Railway 서버가 아니라 Supabase에 저장되므로).
 *
 * 필요한 환경변수: SUPABASE_URL, SUPABASE_SECRET_KEY
 * (Supabase 대시보드 → Settings → API 에서 확인. secret 키는 서버 전용이며
 *  이 파일은 "server-only"이므로 브라우저로는 절대 노출되지 않습니다.)
 */

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SECRET_KEY || "placeholder-key"
);

const STORE_ROW_ID = 1;

const DEFAULT_STORE: StoreSchema = {
  currentPrediction: {
    level: "pass",
    updatedAt: new Date().toISOString(),
    source: "manual",
  },
  history: [],
  accuracy: {
    7: { period: 7, hitRate: 0, hitCount: 0, totalCount: 0, isManualOverride: false, updatedAt: new Date().toISOString() },
    30: { period: 30, hitRate: 0, hitCount: 0, totalCount: 0, isManualOverride: false, updatedAt: new Date().toISOString() },
    100: { period: 100, hitRate: 0, hitCount: 0, totalCount: 0, isManualOverride: false, updatedAt: new Date().toISOString() },
  },
  ads: [
    { id: "ad1", label: "메인 결과 아래", imageUrl: null, linkUrl: null, enabled: true, updatedAt: new Date().toISOString() },
    { id: "ad2", label: "적중률 아래", imageUrl: null, linkUrl: null, enabled: true, updatedAt: new Date().toISOString() },
    { id: "ad3", label: "페이지 하단", imageUrl: null, linkUrl: null, enabled: true, updatedAt: new Date().toISOString() },
  ],
};

async function readStore(): Promise<StoreSchema> {
  const { data, error } = await supabase
    .from("app_store")
    .select("data")
    .eq("id", STORE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase 조회 실패: ${error.message}`);
  }

  if (!data) {
    // 최초 실행: 기본값으로 행을 하나 만들어둡니다.
    await supabase.from("app_store").insert({ id: STORE_ROW_ID, data: DEFAULT_STORE });
    return DEFAULT_STORE;
  }

  return data.data as StoreSchema;
}

async function writeStore(store: StoreSchema): Promise<void> {
  const { error } = await supabase
    .from("app_store")
    .upsert({ id: STORE_ROW_ID, data: store, updated_at: new Date().toISOString() });

  if (error) {
    throw new Error(`Supabase 저장 실패: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// 오늘의 예측
// ---------------------------------------------------------------------------

export async function getCurrentPrediction(): Promise<CurrentPrediction> {
  const store = await readStore();
  return store.currentPrediction;
}

export async function setCurrentPrediction(
  level: PredictionLevel,
  note?: string
): Promise<CurrentPrediction> {
  const store = await readStore();
  store.currentPrediction = {
    level,
    note: note?.trim() || undefined,
    updatedAt: new Date().toISOString(),
    source: "manual",
  };
  await writeStore(store);
  return store.currentPrediction;
}

// ---------------------------------------------------------------------------
// 히스토리
// ---------------------------------------------------------------------------

export async function getHistory(limit?: number): Promise<HistoryEntry[]> {
  const store = await readStore();
  const sorted = [...store.history].sort((a, b) => (a.date < b.date ? 1 : -1));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function addHistoryEntry(
  entry: Omit<HistoryEntry, "id" | "isHit">
): Promise<HistoryEntry> {
  const store = await readStore();
  // 방향(direction) 매칭 기준: 상승/보합(상승) 예측은 실제가 "상승"이면 적중,
  // 하락/보합(하락) 예측은 실제가 "하락"이면 적중. "관망"은 집계에서 제외.
  const direction = predictedDirection(entry.predicted);
  const isHit = direction === null || entry.actual === null ? null : direction === entry.actual;
  const newEntry: HistoryEntry = {
    id: randomUUID(),
    ...entry,
    isHit,
  };
  // 같은 날짜가 이미 있으면 갱신(업서트), 없으면 추가
  const idx = store.history.findIndex((h) => h.date === entry.date);
  if (idx >= 0) {
    store.history[idx] = { ...newEntry, id: store.history[idx].id };
  } else {
    store.history.push(newEntry);
  }
  await writeStore(store);
  return newEntry;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const store = await readStore();
  store.history = store.history.filter((h) => h.id !== id);
  await writeStore(store);
}

// ---------------------------------------------------------------------------
// 적중률
// ---------------------------------------------------------------------------

/** 히스토리 기반으로 최근 N일(방향성 예측을 한 건 기준) 적중률을 자동 계산
 *  "예측 패스"로 기록된 건은 애초에 방향성 예측이 아니므로 집계에서 제외합니다.
 */
export function computeAccuracyFromHistory(
  history: HistoryEntry[],
  period: AccuracyPeriod
): { hitRate: number; hitCount: number; totalCount: number } {
  const resolved = history
    .filter((h) => h.actual !== null && h.predicted !== "pass")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, period);
  const totalCount = resolved.length;
  const hitCount = resolved.filter((h) => h.isHit).length;
  const hitRate = totalCount > 0 ? Math.round((hitCount / totalCount) * 1000) / 10 : 0;
  return { hitRate, hitCount, totalCount };
}

export async function getAccuracyStats(): Promise<Record<AccuracyPeriod, AccuracyStat>> {
  const store = await readStore();
  return store.accuracy;
}

/** 관리자가 수동으로 적중률 값을 덮어쓸 때 */
export async function setAccuracyStat(
  period: AccuracyPeriod,
  hitRate: number,
  hitCount: number,
  totalCount: number
): Promise<AccuracyStat> {
  const store = await readStore();
  const stat: AccuracyStat = {
    period,
    hitRate,
    hitCount,
    totalCount,
    isManualOverride: true,
    updatedAt: new Date().toISOString(),
  };
  store.accuracy[period] = stat;
  await writeStore(store);
  return stat;
}

/** 히스토리 데이터로부터 3개 기간 적중률을 다시 자동 계산해 저장 */
export async function recomputeAccuracyStats(): Promise<Record<AccuracyPeriod, AccuracyStat>> {
  const store = await readStore();
  const periods: AccuracyPeriod[] = [7, 30, 100];
  for (const period of periods) {
    const { hitRate, hitCount, totalCount } = computeAccuracyFromHistory(
      store.history,
      period
    );
    store.accuracy[period] = {
      period,
      hitRate,
      hitCount,
      totalCount,
      isManualOverride: false,
      updatedAt: new Date().toISOString(),
    };
  }
  await writeStore(store);
  return store.accuracy;
}

// ---------------------------------------------------------------------------
// 광고
// ---------------------------------------------------------------------------

export async function getAds(): Promise<AdSlotData[]> {
  const store = await readStore();
  return store.ads;
}

export async function updateAd(
  id: AdSlotData["id"],
  data: Partial<Pick<AdSlotData, "imageUrl" | "linkUrl" | "enabled">>
): Promise<AdSlotData> {
  const store = await readStore();
  const idx = store.ads.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error(`알 수 없는 광고 슬롯: ${id}`);
  store.ads[idx] = {
    ...store.ads[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store.ads[idx];
}
