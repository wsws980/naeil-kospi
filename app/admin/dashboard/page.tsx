import { getCurrentPrediction, getAccuracyStats, getHistory, getAds } from "@/lib/db";
import DashboardShell from "@/components/admin/DashboardShell";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [prediction, accuracy, history, ads] = await Promise.all([
    getCurrentPrediction(),
    getAccuracyStats(),
    getHistory(),
    getAds(),
  ]);

  return (
    <div className="max-w-[560px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
          관리자 대시보드
        </h1>
        <LogoutButton />
      </div>
      <DashboardShell
        prediction={prediction}
        accuracy={accuracy}
        history={history}
        ads={ads}
      />
    </div>
  );
}
