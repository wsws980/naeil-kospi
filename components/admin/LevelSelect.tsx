"use client";

import { PredictionLevel } from "@/lib/types";
import { GAUGE_ORDER, LEVEL_META } from "@/lib/constants";

export default function LevelSelect({
  value,
  onChange,
  name,
}: {
  value: PredictionLevel | null;
  onChange: (level: PredictionLevel) => void;
  name?: string;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={name}>
      {[...GAUGE_ORDER].reverse().map((level) => {
        const meta = LEVEL_META[level];
        const active = value === level;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(level)}
            className="flex flex-col items-center gap-1 rounded-[var(--radius-sm)] py-2.5 text-[11px] font-medium transition-all"
            style={{
              background: active ? meta.bgColor : "var(--bg-elevated)",
              border: `1.5px solid ${active ? meta.color : "var(--border)"}`,
              color: active ? meta.textColor : "var(--text-secondary)",
            }}
          >
            <span className="text-[18px]" aria-hidden="true">
              {meta.emoji}
            </span>
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
