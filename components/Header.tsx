import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div className="max-w-[560px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--level-up)" }}
            aria-hidden="true"
          />
          <span
            className="text-[17px] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            내일 코스피
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
