"use client";

import { useEffect } from "react";
import { LeadSponsorHome } from "@/app/components/sponsor/LeadSponsorHome";
import { SponsorTabBar } from "@/app/sponsor/sponsor-nav";
import { SPONSOR_DASHBOARD_PATH } from "@/app/lib/routes";

export default function SponsorNavPreviewPage() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(
      '[data-testid="sponsor-tab-bar"]'
    );
    if (!nav) return;
    nav.dataset.scrollWidth = String(nav.scrollWidth);
    nav.dataset.clientWidth = String(nav.clientWidth);
    nav.dataset.overflows =
      nav.scrollWidth > nav.clientWidth + 1 ? "yes" : "no";
  }, []);

  return (
    <main className="min-h-screen text-white">
      <header
        data-sponsor-tabs-visible="sponsor-tabs-visible-v1"
        className="border-b border-slate-800 bg-slate-950"
      >
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <p className="text-2xl font-black text-green-400">S4P</p>
          <nav className="w-full min-w-0 overflow-x-hidden text-sm font-semibold text-slate-300 sm:w-auto sm:max-w-full">
            <SponsorTabBar
              homePath={SPONSOR_DASHBOARD_PATH}
              inviteCount={1}
              onDashboard
              onGameTime={false}
              onInvitations={false}
              onLogout={() => {}}
            />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <LeadSponsorHome
          brand="Budweiser Europe"
          logoUrl="/sponsors/budweiser.svg"
          pending={[]}
          signed={[]}
          committedGbp={0}
        />
      </div>
    </main>
  );
}
