"use client";

import { PredictionLevel } from "@/lib/types";
import { GAUGE_ORDER, LEVEL_META } from "@/lib/constants";

export default function LevelSelect({
  value,
  onChange,
  name,
  excludeLevels = [],
}: {
  value: PredictionLevel | null;
  onChange: (level: PredictionLevel) => void;
  name?: string;
  /** 예: 실제 결과 선택에서는 "예측 패스"를 고를 수 없으므로 제외 */
  excludeLevels?: PredictionLevel[];
}) {
  const options = [...GAUGE_ORDER]
    .reverse()
    .filter((level) => !excludeLevels.includes(level));

  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={name}>
      {options.map((level) => {
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
