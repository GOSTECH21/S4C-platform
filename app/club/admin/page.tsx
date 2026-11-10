"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import ClubAdminClubDetails from "@/app/components/club/ClubAdminClubDetails";
import ClubAdminLookbackAndCilt from "@/app/components/club/ClubAdminLookbackAndCilt";
import { CLUB_LOGIN_PATH } from "@/app/lib/routes";
import {
  loadClubSession,
  type ClubAccount,
  type ClubProfile,
} from "@/app/services/club-match-day.service";

export default function ClubAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        router.replace(CLUB_LOGIN_PATH);
        return;
      }
      setClub(session.club);
      setAccount(session.account);
      setLoading(false);
    }
    void load();
  }, [router]);

  if (loading || !club || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading My Admin...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        <ClubAdminClubDetails club={club} account={account} />
        <ClubAdminLookbackAndCilt club={club} />
      </div>
    </main>
  );
}
