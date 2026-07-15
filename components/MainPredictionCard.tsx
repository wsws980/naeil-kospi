import { CurrentPrediction } from "@/lib/types";
import { LEVEL_META } from "@/lib/constants";
import PredictionGauge from "./PredictionGauge";
import { formatUpdatedAt } from "@/lib/format";

export default function MainPredictionCard({
  prediction,
}: {
  prediction: CurrentPrediction;
}) {
  const meta = LEVEL_META[prediction.level];

  return (
    <section
      className="rounded-[var(--radius-lg)] px-6 pt-8 pb-7 flex flex-col items-center text-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      aria-labelledby="main-prediction-heading"
    >
      <p
        className="text-[13px] font-medium tracking-wide mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        내일 코스피 시가 예상
      </p>
      <p
        className="text-[11px] mb-3 max-w-[300px] leading-relaxed"
        style={{ color: "var(--text-tertiary)" }}
      >
        다음 거래일 코스피 시가가 상승에서 출발할지 하락에서 출발할지를 예측하는
        서비스이며, 장중 등락과는 무관합니다.
      </p>
      <h1 id="main-prediction-heading" className="sr-only">
        다음 거래일 코스피 시가 예측: {meta.label}
      </h1>

      <div className="w-full max-w-[300px] -mb-2">
        <PredictionGauge level={prediction.level} />
      </div>

      <div className="flex items-center gap-2.5 mt-1">
        <span className="text-[40px] leading-none" aria-hidden="true">
          {meta.emoji}
        </span>
        <span
          className="text-[32px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: meta.textColor }}
        >
          {meta.label}
        </span>
      </div>

      <p className="text-[13px] mt-2 max-w-[320px]" style={{ color: "var(--text-secondary)" }}>
        {meta.description}
      </p>

      {prediction.note && (
        <p
          className="text-[13px] mt-4 px-4 py-3 rounded-[var(--radius-sm)] w-full"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
        >
          {prediction.note}
        </p>
      )}

      <p
        className="text-[12px] mt-5 tabular-nums"
        style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        업데이트 {formatUpdatedAt(prediction.updatedAt)}
      </p>
    </section>
  );
}
