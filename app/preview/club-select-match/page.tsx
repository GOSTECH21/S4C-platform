"use client";

import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";

export default function ClubSelectMatchPreviewPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <ClubNav />
        <HowS4pSelectMatch
          audience="club"
          initialClub="Hearts"
          clubLocked
          onClubMatchSelected={() =>
            router.push("/preview/club-choose-projects")
          }
        />
      </div>
    </main>
  );
}
