"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 최초 마운트 시 실제 DOM(document.documentElement)의 테마 클래스를 읽어와야 하므로
    // (SSR에서는 알 수 없음) 이 effect에서의 setState는 의도된 동작입니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("naeilkospi-theme", next ? "light" : "dark");
    } catch {
      // 저장 실패해도 토글 자체는 정상 동작
    }
  }

  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "다크 모드로 전환" : "라이트 모드로 전환"}
      className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--text-secondary)",
      }}
    >
      {isLight ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
