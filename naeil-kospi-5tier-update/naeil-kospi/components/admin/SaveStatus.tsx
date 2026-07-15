export default function SaveStatus({
  status,
}: {
  status: { type: "idle" | "success" | "error"; message?: string };
}) {
  if (status.type === "idle") return null;
  return (
    <p
      className="text-[13px] mt-2"
      style={{ color: status.type === "success" ? "var(--level-up)" : "var(--level-down)" }}
    >
      {status.type === "success" ? "저장되었습니다." : status.message || "오류가 발생했습니다."}
    </p>
  );
}
