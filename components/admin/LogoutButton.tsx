"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[13px] font-medium px-3 py-1.5 rounded-full"
      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      로그아웃
    </button>
  );
}
