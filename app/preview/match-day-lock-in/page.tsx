"use client";

import { useState } from "react";
import { MatchDayLockIn } from "@/app/components/sponsor/MatchDayLockIn";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";

export default function MatchDayLockInPreviewPage() {
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Signed in as Budweiser
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Match Day Lock-In
          </h1>
        </div>
        <div id="match-day-lock-in" className="scroll-mt-6">
          <MatchDayLockIn
            brandName="Budweiser"
            lock={lock}
            onLockChange={setLock}
          />
        </div>
      </div>
    </main>
  );
}
