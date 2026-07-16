import { AccuracyPeriod, AccuracyStat } from "@/lib/types";

const PERIOD_LABEL: Record<AccuracyPeriod, string> = {
  7: "최근 7일",
  30: "최근 30일",
  100: "최근 100일",
};

function rateColor(rate: number): string {
  if (rate >= 65) return "var(--level-up)";
  if (rate >= 45) return "var(--level-flat)";
  return "var(--level-down)";
}

export default function AccuracyStats({
  stats,
}: {
  stats: Record<AccuracyPeriod, AccuracyStat>;
}) {
  const periods: AccuracyPeriod[] = [7, 30, 100];

  return (
    <section aria-labelledby="accuracy-heading">
      <h2
        id="accuracy-heading"
        className="text-[15px] font-semibold mb-3 px-1"
        style={{ color: "var(--text-primary)" }}
      >
        최근 적중률
      </h2>
      <div className="grid grid-cols-3 gap-2.5">
        {periods.map((p) => {
          const stat = stats[p];
          return (
            <div
              key={p}
              className="rounded-[var(--radius-md)] px-3 py-4 flex flex-col items-center text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>
                {PERIOD_LABEL[p]}
              </span>
              <span
                className="text-[26px] font-bold tabular-nums"
                style={{ fontFamily: "var(--font-display)", color: rateColor(stat?.hitRate ?? 0) }}
              >
                {stat ? stat.hitRate.toFixed(1) : "–"}
                <span className="text-[15px]">%</span>
              </span>
              <span
                className="text-[11px] mt-1.5 tabular-nums"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                {stat ? `${stat.hitCount}/${stat.totalCount}회` : "데이터 없음"}
              </span>
              {stat && stat.upFailCount > 0 && (
                <span
                  className="text-[10px] mt-1 px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--level-strong-down-bg)", color: "var(--level-strong-down)" }}
                >
                  상승예측실패 {stat.upFailCount}건
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
