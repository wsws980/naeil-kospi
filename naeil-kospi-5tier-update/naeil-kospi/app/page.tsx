import { getCurrentPrediction, getAccuracyStats, getHistory, getAds } from "@/lib/db";
import MainPredictionCard from "@/components/MainPredictionCard";
import AccuracyStats from "@/components/AccuracyStats";
import HistoryTable from "@/components/HistoryTable";
import AdSlot from "@/components/AdSlot";
import ComingSoonGrid from "@/components/ComingSoonGrid";

// 매 요청마다 최신 데이터를 보여줍니다 (관리자가 저장하면 바로 반영).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [prediction, accuracy, history, ads] = await Promise.all([
    getCurrentPrediction(),
    getAccuracyStats(),
    getHistory(20),
    getAds(),
  ]);

  const adMap = Object.fromEntries(ads.map((a) => [a.id, a]));

  return (
    <div className="max-w-[560px] mx-auto px-4 py-5 flex flex-col gap-7">
      <MainPredictionCard prediction={prediction} />

      <AdSlot ad={adMap.ad1} />

      <AccuracyStats stats={accuracy} />

      <AdSlot ad={adMap.ad2} />

      <HistoryTable history={history} />

      <ComingSoonGrid />

      <AdSlot ad={adMap.ad3} />
    </div>
  );
}
