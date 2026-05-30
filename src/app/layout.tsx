import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "벌고 쓸까 - 수입/지출 흐름 시각화",
  description:
    "어디서 벌고, 어디에 쓰는지 한눈에 보세요. Sankey 다이어그램으로 재무 흐름을 시각화합니다.",
  openGraph: {
    title: "벌고 쓸까 - 수입/지출 흐름 시각화",
    description:
      "어디서 벌고, 어디에 쓰는지 한눈에 보세요. Sankey 다이어그램으로 재무 흐름을 시각화합니다.",
    siteName: "벌고 쓸까",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1800,
        height: 1248,
        alt: "쓰레기는 어떻게 벌고 쓸까",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "벌고 쓸까 - 수입/지출 흐름 시각화",
    description:
      "어디서 벌고, 어디에 쓰는지 한눈에 보세요. Sankey 다이어그램으로 재무 흐름을 시각화합니다.",
    images: [
      {
        url: "/twitter-image.png",
        alt: "쓰레기는 어떻게 벌고 쓸까",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
