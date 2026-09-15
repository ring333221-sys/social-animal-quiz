import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "你是哪種社交動物？",
  description: "10 個情境題，打開你的秘密社交人格檔案。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
