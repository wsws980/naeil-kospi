import "server-only";
import fs from "fs/promises";
import path from "path";
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
 * 데이터 저장소
 * ------------------------------------------------------------------
 * 지금은 JSON 파일 기반으로 동작합니다 (별도 DB 세팅 없이 바로 운영 가능).
 *
 * 중요: 재배포해도 데이터가 초기화되지 않으려면 이 파일을
 * "영구 저장 공간(Railway Volume 등)"에 둬야 합니다. DATA_DIR 환경변수로
 * 저장 위치를 바꿀 수 있게 만들어뒀습니다 (기본값은 프로젝트 안의 data 폴더).
 * 파일이 없으면 아래 DEFAULT_STORE로 자동 생성합니다.
 *
 * 트래픽이 늘어나거나 서버리스(Vercel Edge 등) 환경에 배포할 경우,
 * 이 파일의 함수 시그니처만 유지한 채 내부 구현을 Postgres/Supabase 등으로
 * 교체하면 나머지 코드(컴포넌트, API 라우트)는 수정할 필요가 없습니다.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_PATH = path.join(DATA_DIR, "store.json");

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

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureStoreFile(): Promise<void> {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8");
  }
}

async function readStore(): Promise<StoreSchema> {
  await ensureStoreFile();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as StoreSchema;
}

async function writeStore(store: StoreSchema): Promise<void> {
  // 동시 쓰기로 인한 파일 손상을 막기 위해 순차 실행 큐를 사용
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf-8")
  );
  await writeQueue;
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
