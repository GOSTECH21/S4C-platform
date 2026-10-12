import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeBootScript } from "@/app/components/ThemeBootScript";
import ThemeTrialBanner from "@/app/components/ThemeTrialBanner";
import { DEFAULT_S4P_THEME } from "@/app/lib/s4p-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Score-4-our-Planet",
  description:
    "Every score creates a funded impact moment. Fans, sports clubs, local businesses, national sponsors and climate project providers turn match days into climate action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_S4P_THEME}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <ThemeBootScript />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ThemeTrialBanner />
      </body>
    </html>
  );
}
