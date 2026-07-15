"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "로그인에 실패했습니다.");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[400px] mx-auto px-5 py-16">
      <h1
        className="text-[22px] font-bold mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        관리자 로그인
      </h1>
      <p className="text-[13px] mb-7" style={{ color: "var(--text-secondary)" }}>
        내일 코스피 예측 데이터를 관리합니다.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="password" className="text-[13px] font-medium block mb-1.5">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            required
          />
        </div>

        {error && (
          <p className="text-[13px]" style={{ color: "var(--level-down)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] py-2.5 text-[14px] font-semibold mt-1 disabled:opacity-60"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
