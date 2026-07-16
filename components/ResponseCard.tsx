import { MarketResponse } from "@/lib/types";
import { DIRECTION_META } from "@/lib/constants";
import { formatDate, formatUpdatedAt } from "@/lib/format";

function IndexReadingRow({
  label,
  date,
  direction,
}: {
  label: string;
  date: string;
  direction: "up" | "down";
}) {
  const meta = DIRECTION_META[direction];
  return (
    <div
      className="flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        <p
          className="text-[11px] mt-0.5 tabular-nums"
          style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          {formatDate(date)}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[22px] leading-none" style={{ color: meta.color }} aria-hidden="true">
          {meta.emoji}
        </span>
        <span className="text-[14px] font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

export default function ResponseCard({ response }: { response: MarketResponse }) {
  return (
    <section
      className="rounded-[var(--radius-lg)] px-6 pt-8 pb-7 flex flex-col gap-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      aria-labelledby="response-heading"
    >
      <div className="text-center">
        <p
          className="text-[13px] font-medium tracking-wide mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          오늘의 대응
        </p>
        <p className="text-[11px] max-w-[300px] mx-auto leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          간밤 나스닥·코스피 야간선물 흐름을 참고해 아침 대응 방향을 정리한 페이지입니다.
        </p>
        <h1 id="response-heading" className="sr-only">
          오늘의 대응 — 나스닥/코스피 야간선물 및 대응 계획
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        <IndexReadingRow label="나스닥" date={response.nasdaq.date} direction={response.nasdaq.direction} />
        <IndexReadingRow
          label="코스피 야간선물"
          date={response.kospiNightFutures.date}
          direction={response.kospiNightFutures.direction}
        />
      </div>

      {response.responsePlan ? (
        <div>
          <p className="text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            대응 계획
          </p>
          <p
            className="text-[13px] leading-relaxed whitespace-pre-wrap px-4 py-3 rounded-[var(--radius-sm)]"
            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
          >
            {response.responsePlan}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-center" style={{ color: "var(--text-tertiary)" }}>
          아직 오늘의 대응 계획이 입력되지 않았습니다.
        </p>
      )}

      <p
        className="text-[12px] text-center tabular-nums"
        style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        업데이트 {formatUpdatedAt(response.updatedAt)}
      </p>
    </section>
  );
}
