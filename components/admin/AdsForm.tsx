"use client";

import { useState } from "react";
import { AdSlotData } from "@/lib/types";
import SaveStatus from "./SaveStatus";

function AdSlotEditor({ ad, onSaved }: { ad: AdSlotData; onSaved: (a: AdSlotData) => void }) {
  const [linkUrl, setLinkUrl] = useState(ad.linkUrl ?? "");
  const [enabled, setEnabled] = useState(ad.enabled);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(ad.imageUrl);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  function handleClearImage() {
    setFile(null);
    setPreview(null);
  }

  async function handleSave() {
    setSaving(true);
    setStatus({ type: "idle" });
    try {
      const formData = new FormData();
      formData.append("id", ad.id);
      formData.append("linkUrl", linkUrl);
      formData.append("enabled", String(enabled));
      if (file) formData.append("image", file);
      if (!file && preview === null && ad.imageUrl !== null) {
        formData.append("clearImage", "true");
      }
      const res = await fetch("/api/ads", { method: "PUT", body: formData });
      if (!res.ok) throw new Error();
      const updated: AdSlotData = await res.json();
      onSaved(updated);
      setPreview(updated.imageUrl);
      setFile(null);
      setStatus({ type: "success" });
    } catch {
      setStatus({ type: "error", message: "저장에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-[var(--radius-md)] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold">{ad.label}</h3>
        <label className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          노출
        </label>
      </div>

      {preview ? (
        <div className="mb-3 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="배너 미리보기" className="w-full rounded-[var(--radius-sm)]" />
          <button
            onClick={handleClearImage}
            className="mt-2 text-[12px]"
            style={{ color: "var(--level-down)" }}
          >
            이미지 제거
          </button>
        </div>
      ) : (
        <div
          className="mb-3 rounded-[var(--radius-sm)] flex items-center justify-center text-[12px]"
          style={{
            height: 72,
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border)",
            color: "var(--text-tertiary)",
          }}
        >
          배너 없음 (AdSense 등으로 자동 대체)
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div>
          <label className="text-[12px] font-medium block mb-1">이미지 업로드</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="text-[12px] w-full"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium block mb-1">링크 URL</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
            className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-sm)] px-4 py-2 text-[13px] font-semibold self-start disabled:opacity-60"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <SaveStatus status={status} />
      </div>
    </div>
  );
}

export default function AdsForm({ initial }: { initial: AdSlotData[] }) {
  const [ads, setAds] = useState(initial);

  function handleSaved(updated: AdSlotData) {
    setAds((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold px-1">광고 관리</h2>
      {ads.map((ad) => (
        <AdSlotEditor key={ad.id} ad={ad} onSaved={handleSaved} />
      ))}
    </div>
  );
}
