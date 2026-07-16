import { getMarketResponse } from "@/lib/db";
import ResponseCard from "@/components/ResponseCard";

export const dynamic = "force-dynamic";

export default async function ResponsePage() {
  const response = await getMarketResponse();

  return (
    <div className="max-w-[560px] mx-auto px-4 py-5">
      <ResponseCard response={response} />
    </div>
  );
}
