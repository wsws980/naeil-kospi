"use client";

import { useState } from "react";
import { CurrentPrediction, PredictionLevel } from "@/lib/types";
import LevelSelect from "./LevelSelect";
import SaveStatus from "./SaveStatus";
import { formatUpdatedAt } from "@/lib/format";

export default function PredictionForm({ initial }: { initial: CurrentPrediction }) {
  const [level, setLevel] = useState<PredictionLevel>(initial.level);
  const [note, setNote] = useState(initial.note ?? "");
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  async function handleSave() {
    setSaving(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, note }),
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
      <h2 className="text-[15px] font-semibold mb-1">내일 코스피 시가 예측</h2>
      <p className="text-[12px] mb-4 tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        현재 반영중: {formatUpdatedAt(updatedAt)}
      </p>

      <LevelSelect value={level} onChange={setLevel} name="내일 시가 예측" />

      <div className="mt-4">
        <label htmlFor="note" className="text-[13px] font-medium block mb-1.5">
          코멘트 (선택)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="예: 반도체 업종 강세 및 미국 증시 상승 마감 영향"
          className="w-full rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[13px] resize-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
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
