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
        <header className="sticky top-[4.75rem] z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 sm:top-[5.25rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Supporter
          </p>
          <FanTabBar pathname={SUPPORTER_CAMPAIGN_PATH} onLogout={() => {}} />
        </header>
        <p className="text-sm font-semibold">Five fan tabs, no horizontal scroll.</p>
      </div>
    </main>
  );
}
