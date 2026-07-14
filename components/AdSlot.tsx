import { AdSlotData } from "@/lib/types";

/**
 * 광고 슬롯
 * ------------------------------------------------------------------
 * - 관리자가 배너 이미지를 업로드하면 그 배너를 노출
 * - 배너가 없으면(광고주 미확보 시) AdSense 등을 붙이기 쉬운 빈 컨테이너를 렌더링
 *   → 이 <div id="adsense-slot-..."> 자리에 애드센스 스크립트/태그만 추가하면 됨
 */
export default function AdSlot({ ad }: { ad: AdSlotData | undefined }) {
  if (!ad || !ad.enabled) return null;

  if (ad.imageUrl) {
    const content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ad.imageUrl}
        alt={`광고 — ${ad.label}`}
        className="w-full h-auto rounded-[var(--radius-md)] block"
      />
    );
    return (
      <div className="w-full">
        {ad.linkUrl ? (
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener sponsored"
            aria-label={`광고: ${ad.label} — 새 창에서 열림`}
          >
            {content}
          </a>
        ) : (
          content
        )}
        <p className="text-[10px] mt-1 text-center" style={{ color: "var(--text-tertiary)" }}>
          광고
        </p>
      </div>
    );
  }

  // 광고주 배너가 없을 때: Google AdSense를 바로 붙일 수 있는 자리
  return (
    <div
      id={`adsense-slot-${ad.id}`}
      className="w-full rounded-[var(--radius-md)] flex items-center justify-center"
      style={{
        minHeight: 90,
        background: "var(--surface)",
        border: "1px dashed var(--border)",
        color: "var(--text-tertiary)",
      }}
    >
      {/*
        예: <ins className="adsbygoogle" style={{display:"block"}}
             data-ad-client="ca-pub-XXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto" ... />
      */}
      <span className="text-[12px]">광고 영역</span>
    </div>
  );
}
