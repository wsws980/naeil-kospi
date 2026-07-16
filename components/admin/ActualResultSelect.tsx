"use client";

import { ActualResult } from "@/lib/types";
import { ACTUAL_META } from "@/lib/constants";

const OPTIONS: ActualResult[] = ["up", "down"];

export default function ActualResultSelect({
  value,
  onChange,
  name,
}: {
  value: ActualResult | null;
  onChange: (result: ActualResult) => void;
  name?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={name}>
      {OPTIONS.map((result) => {
        const meta = ACTUAL_META[result];
        const active = value === result;
        return (
          <button
            key={result}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(result)}
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
