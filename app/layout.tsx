import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://naeil-kospi.example.com"),
  title: "내일 코스피 — 다음 거래일 시가 예측",
  description:
    "매일 장 마감 후, 다음 거래일 코스피 시가가 강한 상승·상승·보합·하락·강한 하락 중 어디에 해당할지 확인하세요.",
  keywords: ["코스피", "시가", "갭상승", "갭하락", "주식", "코스피 전망", "내일 코스피"],
  openGraph: {
    title: "내일 코스피 — 다음 거래일 시가 예측",
    description: "장 마감 후 5초 만에 확인하는 내일의 코스피 시가 전망",
    locale: "ko_KR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Google Analytics 4 측정 ID. Railway Variables에 NEXT_PUBLIC_GA_MEASUREMENT_ID를
// 설정하면 그 값을 쓰고, 없으면 아래 기본값을 사용합니다.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-85XJT29CWJ";

/** 페이지 렌더 전에 다크/라이트 클래스를 미리 적용해 깜빡임(FOUC)을 방지 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("naeilkospi-theme");
    var theme = stored || "dark";
    if (theme === "light") {
      document.documentElement.classList.add("light");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
