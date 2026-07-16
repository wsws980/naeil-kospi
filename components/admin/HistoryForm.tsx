"use client";

import { useState } from "react";
import { HistoryEntry, PredictionLevel, ActualResult } from "@/lib/types";
import LevelSelect from "./LevelSelect";
import ActualResultSelect from "./ActualResultSelect";
import SaveStatus from "./SaveStatus";
import { LEVEL_META, ACTUAL_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";

function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export default function HistoryForm({ initial }: { initial: HistoryEntry[] }) {
  const [history, setHistory] = useState(initial);
  const [date, setDate] = useState(todayKST());
  const [predicted, setPredicted] = useState<PredictionLevel>("pass");
  const [actual, setActual] = useState<ActualResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  async function handleAdd() {
    setSaving(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, predicted, actual }),
      });
      if (!res.ok) throw new Error();
      const entry: HistoryEntry = await res.json();
      setHistory((prev) => {
        const withoutDup = prev.filter((h) => h.date !== entry.date);
        return [entry, ...withoutDup].sort((a, b) => (a.date < b.date ? 1 : -1));
      });
      setStatus({ type: "success" });
    } catch {
      setStatus({ type: "error", message: "추가에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      setStatus({ type: "error", message: "삭제에 실패했습니다." });
    }
  }

  return (
    <div
      className="rounded-[var(--radius-md)] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-[15px] font-semibold mb-4">과거 예측 추가</h2>

      <div className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="hist-date" className="text-[13px] font-medium block mb-1.5">
            날짜
          </label>
          <input
            id="hist-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-[var(--radius-sm)] px-3 py-2 text-[13px] tabular-nums"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          />
        </div>

        <div>
          <p className="text-[13px] font-medium mb-1.5">예측</p>
          <LevelSelect value={predicted} onChange={setPredicted} name="예측" />
          <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
            &ldquo;관망&rdquo;을 선택하면 적중률 집계에서 제외됩니다.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[13px] font-medium">실제 결과</p>
            {actual !== null && (
              <button
                onClick={() => setActual(null)}
                className="text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                결과 없음으로
              </button>
            )}
          </div>
          <ActualResultSelect value={actual} onChange={setActual} name="실제 결과" />
          <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
            실제 결과는 시가 등락 방향(상승/하락)만 기록합니다.
          </p>
        </div>

        <button
          onClick={handleAdd}
          disabled={saving}
          className="rounded-[var(--radius-sm)] px-5 py-2.5 text-[14px] font-semibold disabled:opacity-60 self-start"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          {saving ? "저장 중..." : "추가 / 갱신"}
        </button>
        <SaveStatus status={status} />
      </div>

      <div className="mt-6" style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
        <p className="text-[13px] font-medium mb-2.5" style={{ color: "var(--text-secondary)" }}>
          최근 기록 ({history.length}건)
        </p>
        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: "var(--bg-elevated)" }}
            >
              <span className="tabular-nums w-16 shrink-0" style={{ color: "var(--text-tertiary)" }}>
                {formatDate(h.date)}
              </span>
              <span>{LEVEL_META[h.predicted].emoji}</span>
              <span style={{ color: "var(--text-tertiary)" }}>→</span>
              <span>{h.actual ? ACTUAL_META[h.actual].emoji : "대기중"}</span>
              <button
                onClick={() => handleDelete(h.id)}
                className="ml-auto text-[11px] px-2 py-1 rounded-full"
                style={{ color: "var(--level-down)" }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
