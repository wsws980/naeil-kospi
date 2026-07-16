"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageToggle() {
  const pathname = usePathname();
  const isResponse = pathname?.startsWith("/response");

  return (
    <div
      className="flex gap-1 p-1 rounded-full"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      role="tablist"
    >
      <Link
        href="/"
        role="tab"
        aria-selected={!isResponse}
        className="text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors"
        style={{
          background: !isResponse ? "var(--brand)" : "transparent",
          color: !isResponse ? "#fff" : "var(--text-secondary)",
        }}
      >
        예측
      </Link>
      <Link
        href="/response"
        role="tab"
        aria-selected={isResponse}
        className="text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors"
        style={{
          background: isResponse ? "var(--brand)" : "transparent",
          color: isResponse ? "#fff" : "var(--text-secondary)",
        }}
      >
        대응
      </Link>
    </div>
  );
}
