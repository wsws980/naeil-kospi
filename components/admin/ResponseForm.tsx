"use client";

import { useState } from "react";
import { MarketResponse, Direction } from "@/lib/types";
import { DIRECTION_META } from "@/lib/constants";
import SaveStatus from "./SaveStatus";
import { formatUpdatedAt } from "@/lib/format";

function DirectionToggle({
  value,
  onChange,
  label,
}: {
  value: Direction;
  onChange: (d: Direction) => void;
  label: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={label}>
      {(["up", "down"] as Direction[]).map((d) => {
        const meta = DIRECTION_META[d];
        const active = value === d;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(d)}
            className="flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] py-2 text-[13px] font-semibold transition-all"
            style={{
              background: active ? "var(--bg-elevated)" : "transparent",
              border: `1.5px solid ${active ? meta.color : "var(--border)"}`,
              color: active ? meta.color : "var(--text-secondary)",
            }}
          >
            <span aria-hidden="true">{meta.emoji}</span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export default function ResponseForm({ initial }: { initial: MarketResponse }) {
  const [nasdaqDate, setNasdaqDate] = useState(initial.nasdaq.date || todayKST());
  const [nasdaqDirection, setNasdaqDirection] = useState<Direction>(initial.nasdaq.direction);
  const [kospiNightDate, setKospiNightDate] = useState(
    initial.kospiNightFutures.date || todayKST()
  );
  const [kospiNightDirection, setKospiNightDirection] = useState<Direction>(
    initial.kospiNightFutures.direction
  );
  const [responsePlan, setResponsePlan] = useState(initial.responsePlan);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  async function handleSave() {
    setSaving(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nasdaqDate,
          nasdaqDirection,
          kospiNightDate,
          kospiNightDirection,
          responsePlan,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUpdatedAt(data.updatedAt);
      setStatus({ type: "success" });
    } catch {
      setStatus({ type: "error", message: "저장에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-[var(--radius-md)] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-[15px] font-semibold mb-1">오늘의 대응</h2>
      <p className="text-[12px] mb-4 tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        현재 반영중: {formatUpdatedAt(updatedAt)}
      </p>
      <p className="text-[11px] mb-4" style={{ color: "var(--text-tertiary)" }}>
        지금은 수기 입력이며, 나중에 자동 연동으로 교체할 수 있도록 구조를 분리해두었습니다.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="nasdaq-date" className="text-[13px] font-medium block mb-1.5">
            나스닥 날짜
          </label>
          <input
            id="nasdaq-date"
            type="date"
            value={nasdaqDate}
            onChange={(e) => setNasdaqDate(e.target.value)}
            className="rounded-[var(--radius-sm)] px-3 py-2 text-[13px] tabular-nums mb-2"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          />
          <DirectionToggle value={nasdaqDirection} onChange={setNasdaqDirection} label="나스닥 방향" />
        </div>

        <div>
          <label htmlFor="kospi-night-date" className="text-[13px] font-medium block mb-1.5">
            코스피 야간선물 날짜
          </label>
          <input
            id="kospi-night-date"
            type="date"
            value={kospiNightDate}
            onChange={(e) => setKospiNightDate(e.target.value)}
            className="rounded-[var(--radius-sm)] px-3 py-2 text-[13px] tabular-nums mb-2"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          />
          <DirectionToggle
            value={kospiNightDirection}
            onChange={setKospiNightDirection}
            label="코스피 야간선물 방향"
          />
        </div>

        <div>
          <label htmlFor="response-plan" className="text-[13px] font-medium block mb-1.5">
            대응 계획 (아침에 대응하기 전 생각 정리)
          </label>
          <textarea
            id="response-plan"
            value={responsePlan}
            onChange={(e) => setResponsePlan(e.target.value)}
            rows={5}
            placeholder="예: 나스닥 약세 + 코스피 야간선물 하락이라 오늘은 시가 확인 후 신규 진입 보류, 기존 포지션은 -1.5% 손절 라인 유지"
            className="w-full rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[13px] resize-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-[var(--radius-sm)] px-5 py-2.5 text-[14px] font-semibold disabled:opacity-60"
        style={{ background: "var(--brand)", color: "#fff" }}
      >
        {saving ? "저장 중..." : "저장"}
      </button>

      <SaveStatus status={status} />
    </div>
  );
}
