import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * 아주 가벼운 관리자 인증
 * ------------------------------------------------------------------
 * - 별도 회원 시스템 없이 "관리자 비밀번호 1개"로 로그인
 * - 로그인 성공 시 HMAC 서명된 세션 토큰을 httpOnly 쿠키로 발급
 * - 운영 규모가 커지면 NextAuth 등으로 교체 가능하도록 함수만 분리
 */

const SESSION_COOKIE_NAME = "naeilkospi_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12시간

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다. .env.local을 확인하세요."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expiresAt}`;
  const signature = sign(payload);
  return { token: `${payload}.${signature}`, expiresAt };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresAtStr, signature] = parts;
  const payload = `${role}.${expiresAtStr}`;
  const expectedSignature = sign(payload);
  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expectedSignature);
  if (sigA.length !== sigB.length) return false;
  if (!timingSafeEqual(sigA, sigB)) return false;
  const expiresAt = Number(expiresAtStr);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
  return role === "admin";
}

export { SESSION_COOKIE_NAME };
