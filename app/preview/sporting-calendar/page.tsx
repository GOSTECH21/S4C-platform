"use client";

import { useState } from "react";
import { SportingCalendarBoard } from "@/app/components/sponsor/SportingCalendarBoard";
import {
  budweiserExamplePicks,
  describeGlobalPicks,
  type GlobalMatchPick,
} from "@/app/lib/global-match-day";

export default function SportingCalendarPreviewPage() {
  const [notice, setNotice] = useState<string | null>(null);
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <SportingCalendarBoard
          brandName="Budweiser"
          logoUrl="/sponsors/budweiser.svg"
          initialPicks={budweiserExamplePicks()}
          notice={notice}
          showExampleButton
          onLockPicks={(picks: GlobalMatchPick[]) =>
            setNotice(
              `Locked ${picks.length} named Matches for Budweiser: ${describeGlobalPicks(picks)}.`
            )
          }
        />
      </div>
    </main>
  );
}
