"use client";

import { useState } from "react";
import {
  CurrentPrediction,
  AccuracyPeriod,
  AccuracyStat,
  HistoryEntry,
  AdSlotData,
  MarketResponse,
} from "@/lib/types";
import PredictionForm from "./PredictionForm";
import AccuracyForm from "./AccuracyForm";
import HistoryForm from "./HistoryForm";
import AdsForm from "./AdsForm";
import ResponseForm from "./ResponseForm";

type Tab = "prediction" | "accuracy" | "history" | "ads" | "response";

const TABS: { id: Tab; label: string }[] = [
  { id: "prediction", label: "내일 예측" },
  { id: "accuracy", label: "적중률" },
  { id: "history", label: "과거 예측" },
  { id: "response", label: "대응" },
  { id: "ads", label: "광고 관리" },
];

export default function DashboardShell({
  prediction,
  accuracy,
  history,
  ads,
  marketResponse,
}: {
  prediction: CurrentPrediction;
  accuracy: Record<AccuracyPeriod, AccuracyStat>;
  history: HistoryEntry[];
  ads: AdSlotData[];
  marketResponse: MarketResponse;
}) {
  const [tab, setTab] = useState<Tab>("prediction");

  return (
    <div>
      <div
        className="flex gap-1 p-1 rounded-full mb-6 w-fit flex-wrap"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        role="tablist"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors"
            style={{
              background: tab === t.id ? "var(--brand)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-secondary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "prediction" && <PredictionForm initial={prediction} />}
      {tab === "accuracy" && <AccuracyForm initial={accuracy} />}
      {tab === "history" && <HistoryForm initial={history} />}
      {tab === "response" && <ResponseForm initial={marketResponse} />}
      {tab === "ads" && <AdsForm initial={ads} />}
    </div>
  );
}
