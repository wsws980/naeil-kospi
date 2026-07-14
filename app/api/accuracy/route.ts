import { NextRequest, NextResponse } from "next/server";
import {
  getAccuracyStats,
  setAccuracyStat,
  recomputeAccuracyStats,
} from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { AccuracyPeriod } from "@/lib/types";

const VALID_PERIODS: AccuracyPeriod[] = [7, 30, 100];

export async function GET() {
  const stats = await getAccuracyStats();
  return NextResponse.json(stats);
}

/** 관리자가 특정 기간의 적중률을 수동으로 입력/수정 */
export async function PUT(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const period = Number(body?.period) as AccuracyPeriod;
  const hitCount = Number(body?.hitCount);
  const totalCount = Number(body?.totalCount);

  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json(
      { error: "period는 7, 30, 100 중 하나여야 합니다." },
      { status: 400 }
    );
  }
  if (
    !Number.isFinite(hitCount) ||
    !Number.isFinite(totalCount) ||
    hitCount < 0 ||
    totalCount < 0 ||
    hitCount > totalCount
  ) {
    return NextResponse.json(
      { error: "적중 건수/전체 건수 값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const hitRate = totalCount > 0 ? Math.round((hitCount / totalCount) * 1000) / 10 : 0;
  const stat = await setAccuracyStat(period, hitRate, hitCount, totalCount);
  return NextResponse.json(stat);
}

/** 히스토리 데이터 기준으로 다시 자동 계산 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const stats = await recomputeAccuracyStats();
  return NextResponse.json(stats);
}
