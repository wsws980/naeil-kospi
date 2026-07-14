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
} from "./types";

/**
 * 데이터 저장소
 * ------------------------------------------------------------------
 * 지금은 JSON 파일 기반으로 동작합니다 (별도 DB 세팅 없이 바로 운영 가능).
 * 트래픽이 늘어나거나 서버리스(Vercel Edge 등) 환경에 배포할 경우,
 * 이 파일의 함수 시그니처만 유지한 채 내부 구현을 Postgres/Supabase 등으로
 * 교체하면 나머지 코드(컴포넌트, API 라우트)는 수정할 필요가 없습니다.
 */

const DATA_PATH = path.join(process.cwd(), "data", "store.json");

let writeQueue: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<StoreSchema> {
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
  const isHit =
    entry.actual !== null ? entry.actual === entry.predicted : null;
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

/** 히스토리 기반으로 최근 N일(실제 결과가 입력된 건 기준) 적중률을 자동 계산 */
export function computeAccuracyFromHistory(
  history: HistoryEntry[],
  period: AccuracyPeriod
): { hitRate: number; hitCount: number; totalCount: number } {
  const resolved = history
    .filter((h) => h.actual !== null)
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
