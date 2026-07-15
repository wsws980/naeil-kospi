export default function Footer() {
  return (
    <footer
      className="mt-10"
      style={{ borderTop: "1px solid var(--border-soft)" }}
    >
      <div className="max-w-[560px] mx-auto px-5 py-8 flex flex-col gap-3">
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          내일 코스피는 다음 거래일 코스피 <strong>시가</strong>의 방향성 참고 정보를 제공하며,
          투자 조언이나 매매 추천이 아닙니다. 예측은 실제 결과와 다를 수 있으며,
          투자 판단과 그 책임은 이용자 본인에게 있습니다.
        </p>
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          © {new Date().getFullYear()} 내일 코스피
        </p>
      </div>
    </footer>
  );
}
