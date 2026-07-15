import { COMING_SOON_ITEMS } from "@/lib/constants";

export default function ComingSoonGrid() {
  return (
    <section aria-labelledby="coming-soon-heading">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h2
          id="coming-soon-heading"
          className="text-[15px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          곧 추가될 서비스
        </h2>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--border-soft)", color: "var(--text-secondary)" }}
        >
          Coming Soon
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {COMING_SOON_ITEMS.map((item) => (
          <div
            key={item.id}
            className="rounded-[var(--radius-md)] px-2 py-4 flex flex-col items-center gap-1.5 text-center opacity-60"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="text-[20px]" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
