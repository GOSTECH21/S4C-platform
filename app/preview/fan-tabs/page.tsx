"use client";

import { useEffect } from "react";
import { FanTabBar } from "@/app/dashboard/supporter/components/FanTabBar";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function FanTabsPreviewPage() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('[data-fan-tabs="5"]');
    if (!nav) return;
    nav.dataset.scrollWidth = String(nav.scrollWidth);
    nav.dataset.clientWidth = String(nav.clientWidth);
    nav.dataset.overflows =
      nav.scrollWidth > nav.clientWidth + 1 ? "yes" : "no";
  }, []);

  return (
    <main className="min-h-screen p-4 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4">
          <p className="text-2xl font-black tracking-tight text-green-400">S4P</p>
          <FanTabBar pathname={SUPPORTER_CAMPAIGN_PATH} onLogout={() => {}} />
        </header>
        <p className="text-sm font-semibold">Five fan tabs, no horizontal scroll.</p>
      </div>
    </main>
  );
}
