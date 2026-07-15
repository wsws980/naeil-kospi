"use client";

import { useState } from "react";
import { AccuracyPeriod, AccuracyStat } from "@/lib/types";
import SaveStatus from "./SaveStatus";

const PERIOD_LABEL: Record<AccuracyPeriod, string> = {
  7: "최근 7일",
  30: "최근 30일",
  100: "최근 100일",
};

export default function AccuracyForm({
  initial,
}: {
  initial: Record<AccuracyPeriod, AccuracyStat>;
}) {
  const [stats, setStats] = useState(initial);
  const [savingPeriod, setSavingPeriod] = useState<AccuracyPeriod | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  function updateField(period: AccuracyPeriod, field: "hitCount" | "totalCount", value: number) {
    setStats((prev) => ({
      ...prev,
      [period]: { ...prev[period], [field]: value },
    }));
  }

  async function handleSave(period: AccuracyPeriod) {
    setSavingPeriod(period);
    setStatus({ type: "idle" });
    const stat = stats[period];
    try {
      const res = await fetch("/api/accuracy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          hitCount: stat.hitCount,
          totalCount: stat.totalCount,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setStats((prev) => ({ ...prev, [period]: updated }));
      setStatus({ type: "success" });
    } catch {
      setStatus({ type: "error", message: "저장에 실패했습니다." });
    } finally {
      setSavingPeriod(null);
    }
  }

  async function handleRecompute() {
    setRecomputing(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/accuracy", { method: "POST" });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setStats(updated);
      setStatus({ type: "success" });
    } catch {
      setStatus({ type: "error", message: "자동 계산에 실패했습니다." });
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <div
      className="rounded-[var(--radius-md)] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold">최근 적중률 수정</h2>
        <button
          onClick={handleRecompute}
          disabled={recomputing}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full disabled:opacity-60"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          {recomputing ? "계산 중..." : "과거 예측에서 자동 계산"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {([7, 30, 100] as AccuracyPeriod[]).map((period) => {
          const stat = stats[period];
          return (
            <div
              key={period}
              className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap"
              style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 12 }}
            >
              <span className="text-[13px] font-medium w-20 shrink-0">{PERIOD_LABEL[period]}</span>
              <input
                type="number"
                min={0}
                value={stat.hitCount}
                onChange={(e) => updateField(period, "hitCount", Number(e.target.value))}
                className="w-16 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] tabular-nums"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                aria-label={`${PERIOD_LABEL[period]} 적중 건수`}
              />
              <span className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                /
              </span>
              <input
                type="number"
                min={0}
                value={stat.totalCount}
                onChange={(e) => updateField(period, "totalCount", Number(e.target.value))}
                className="w-16 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] tabular-nums"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                aria-label={`${PERIOD_LABEL[period]} 전체 건수`}
              />
              <span className="text-[13px] tabular-nums w-14" style={{ color: "var(--text-secondary)" }}>
                {stat.hitRate.toFixed(1)}%
              </span>
              <button
                onClick={() => handleSave(period)}
                disabled={savingPeriod === period}
                className="ml-auto text-[13px] font-semibold px-4 py-1.5 rounded-[var(--radius-sm)] disabled:opacity-60"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                {savingPeriod === period ? "저장 중" : "저장"}
              </button>
            </div>
          );
        })}
      </div>

      <SaveStatus status={status} />
    </div>
  );
}
