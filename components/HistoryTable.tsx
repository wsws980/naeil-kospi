import { HistoryEntry } from "@/lib/types";
import { LEVEL_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";

function LevelBadge({ level }: { level: HistoryEntry["predicted"] }) {
  const meta = LEVEL_META[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap"
      style={{ background: meta.bgColor, color: meta.textColor }}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.shortLabel}
    </span>
  );
}

export default function HistoryTable({ history }: { history: HistoryEntry[] }) {
  return (
    <section aria-labelledby="history-heading">
      <h2
        id="history-heading"
        className="text-[15px] font-semibold mb-3 px-1"
        style={{ color: "var(--text-primary)" }}
      >
        과거 예측
      </h2>
      <div
        className="rounded-[var(--radius-md)] overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
      >
        {history.length === 0 ? (
          <p className="text-[13px] text-center py-10" style={{ color: "var(--text-tertiary)" }}>
            아직 기록된 예측이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th
                    className="text-left font-medium px-3.5 py-2.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    날짜
                  </th>
                  <th
                    className="text-left font-medium px-3.5 py-2.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    예측
                  </th>
                  <th
                    className="text-left font-medium px-3.5 py-2.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    실제 결과
                  </th>
                  <th
                    className="text-center font-medium px-3.5 py-2.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    적중
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom:
                        i === history.length - 1 ? "none" : "1px solid var(--border-soft)",
                    }}
                  >
                    <td
                      className="px-3.5 py-2.5 tabular-nums whitespace-nowrap"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                    >
                      {formatDate(h.date)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <LevelBadge level={h.predicted} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      {h.actual ? (
                        <LevelBadge level={h.actual} />
                      ) : (
                        <span style={{ color: "var(--text-tertiary)" }}>대기중</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {h.isHit === null ? (
                        <span style={{ color: "var(--text-tertiary)" }}>–</span>
                      ) : h.isHit ? (
                        <span style={{ color: "var(--level-up)" }} aria-label="적중">
                          ✓
                        </span>
                      ) : (
                        <span style={{ color: "var(--level-down)" }} aria-label="적중 실패">
                          ✕
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
