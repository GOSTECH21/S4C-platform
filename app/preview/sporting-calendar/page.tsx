"use client";

import { SportingCalendarBoard } from "@/app/components/sponsor/SportingCalendarBoard";
import { budweiserExamplePicks } from "@/app/lib/global-match-day";

export default function SportingCalendarPreviewPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <SportingCalendarBoard
          brandName="Budweiser"
          initialPicks={budweiserExamplePicks()}
          showExampleButton
        />
      </div>
    </main>
  );
}
