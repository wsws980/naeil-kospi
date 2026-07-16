import { NextRequest, NextResponse } from "next/server";
import { getMarketResponse, setMarketResponse } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { Direction } from "@/lib/types";

const VALID_DIRECTIONS: Direction[] = ["up", "down"];

export async function GET() {
  const response = await getMarketResponse();
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nasdaqDate = body?.nasdaqDate as string | undefined;
  const nasdaqDirection = body?.nasdaqDirection as Direction | undefined;
  const kospiNightDate = body?.kospiNightDate as string | undefined;
  const kospiNightDirection = body?.kospiNightDirection as Direction | undefined;
  const responsePlan = (body?.responsePlan as string | undefined) ?? "";

  if (!nasdaqDate || !/^\d{4}-\d{2}-\d{2}$/.test(nasdaqDate)) {
    return NextResponse.json({ error: "나스닥 날짜 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!kospiNightDate || !/^\d{4}-\d{2}-\d{2}$/.test(kospiNightDate)) {
    return NextResponse.json({ error: "코스피 야간선물 날짜 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!nasdaqDirection || !VALID_DIRECTIONS.includes(nasdaqDirection)) {
    return NextResponse.json({ error: "나스닥 방향 값이 올바르지 않습니다." }, { status: 400 });
  }
  if (!kospiNightDirection || !VALID_DIRECTIONS.includes(kospiNightDirection)) {
    return NextResponse.json({ error: "코스피 야간선물 방향 값이 올바르지 않습니다." }, { status: 400 });
  }

  const updated = await setMarketResponse({
    nasdaqDate,
    nasdaqDirection,
    kospiNightDate,
    kospiNightDirection,
    responsePlan,
  });
  return NextResponse.json(updated);
}
