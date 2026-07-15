import { NextRequest, NextResponse } from "next/server";
import {
  getHistory,
  addHistoryEntry,
  deleteHistoryEntry,
  recomputeAccuracyStats,
} from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { PREDICTION_LEVELS, PredictionLevel, ACTUAL_RESULTS, ActualResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const history = await getHistory(limit);
  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const date = body?.date as string | undefined;
  const predicted = body?.predicted as PredictionLevel | undefined;
  const actual = (body?.actual ?? null) as ActualResult | null;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "날짜는 YYYY-MM-DD 형식이어야 합니다." },
      { status: 400 }
    );
  }
  if (!predicted || !PREDICTION_LEVELS.includes(predicted)) {
    return NextResponse.json(
      { error: "예측 값이 올바르지 않습니다." },
      { status: 400 }
    );
  }
  if (actual !== null && !ACTUAL_RESULTS.includes(actual)) {
    return NextResponse.json(
      { error: "실제 결과 값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const entry = await addHistoryEntry({ date, predicted, actual });
  // 히스토리가 바뀌면 자동 계산 적중률도 최신화 (수동 override는 유지하지 않고 갱신)
  await recomputeAccuracyStats();
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }
  await deleteHistoryEntry(id);
  await recomputeAccuracyStats();
  return NextResponse.json({ ok: true });
}
