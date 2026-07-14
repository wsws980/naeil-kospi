import { NextRequest, NextResponse } from "next/server";
import { getCurrentPrediction, setCurrentPrediction } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { PREDICTION_LEVELS, PredictionLevel } from "@/lib/types";

export async function GET() {
  const prediction = await getCurrentPrediction();
  return NextResponse.json(prediction);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const level = body?.level as PredictionLevel | undefined;
  const note = body?.note as string | undefined;

  if (!level || !PREDICTION_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: "올바르지 않은 예측 값입니다." },
      { status: 400 }
    );
  }

  const updated = await setCurrentPrediction(level, note);
  return NextResponse.json(updated);
}
