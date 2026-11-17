"use client";

import { LocalSponsorMyS4p } from "@/app/components/sponsor/LocalSponsorMyS4p";
import { SponsorTabBar } from "@/app/sponsor/sponsor-nav";
import { localSponsorMyS4pSnapshot } from "@/app/lib/local-sponsor-mys4p";
import { LOCAL_SPONSOR_HOME_PATH } from "@/app/lib/routes";
import { createLocalWallet } from "@/app/lib/sponsor-wallet";
import { S4P_SPONSOR_MARK } from "@/app/lib/s4p-tabs";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";

const record: LocalSponsorRecord = {
  brandName: "The Stadium Cafe",
  email: "cafe@example.test",
  clubName: "Hearts",
  pledgeGbp: 750,
  createdAt: "2026-10-26T09:00:00.000Z",
  source: "registered",
  matchSponsorships: [
    {
      fixtureName: "Hearts v Rangers",
      amountGbp: 750,
      projectName: "Meadows Community Energy",
    },
  ],
  submittedAt: "2026-10-26T10:00:00.000Z",
  acceptedTerms: true,
  signerName: "Alex Cafe",
  signedAt: "2026-10-26T10:00:00.000Z",
  sponsoredProjectName: "Meadows Community Energy",
};

const snapshot = localSponsorMyS4pSnapshot({
  brandName: "The Stadium Cafe",
  records: [record],
  wallets: [
    {
      ...createLocalWallet({
        clubName: "Hearts",
        brandName: "The Stadium Cafe",
        sponsorshipGbp: 750,
        sponsoredProjectName: "Meadows Community Energy",
      }),
      allocatedGbp: 2,
    },
  ],
  takes: [
    {
      amountGbp: 0.2,
      projectName: "Meadows Community Energy",
      brandName: "The Stadium Cafe",
      clubName: "Hearts",
      at: "2026-10-26T12:00:00.000Z",
    },
    {
      amountGbp: 0.2,
      projectName: "Meadows Community Energy",
      brandName: "The Stadium Cafe",
      clubName: "Hearts",
      at: "2026-10-26T12:01:00.000Z",
    },
  ],
});

export default function LocalMyS4pPreviewPage() {
  return (
    <main className="min-h-screen text-white">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 px-4 py-4 sm:px-6">
          <p className="sr-only" data-testid="s4p-sponsor-mark">
            {S4P_SPONSOR_MARK}
          </p>
          <nav className="w-full min-w-0 overflow-x-hidden text-sm font-semibold text-slate-300">
            <SponsorTabBar
              homePath={LOCAL_SPONSOR_HOME_PATH}
              inviteCount={1}
              onDashboard={false}
              onGameTime={false}
              onInvitations={false}
              onMyS4p
              onLogout={() => {}}
            />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <LocalSponsorMyS4p
          brand="The Stadium Cafe"
          logoUrl={null}
          snapshot={snapshot}
        />
      </div>
    </main>
  );
}
