"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SponsorNav } from "@/app/sponsor/sponsor-nav";
import { SponsorInviteInbox } from "@/app/components/sponsor/SponsorInviteInbox";
import { SPONSOR_LOGIN_PATH } from "@/app/lib/routes";
import type { SponsorInviteRound, SponsorListing } from "@/app/lib/sponsor-listings";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  invitesWaitingForBrand,
  listingForBrand,
} from "@/app/services/sponsor-listings.service";

export default function SponsorInvitationsPage() {
  const router = useRouter();
  const [listing, setListing] = useState<SponsorListing | null>(null);
  const [rounds, setRounds] = useState<SponsorInviteRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
        const row = listingForBrand(brandName, String(sponsor.website ?? ""));
        setListing(row);
        setRounds(brandName ? invitesWaitingForBrand(brandName) : []);
      } catch {
        try {
          const raw = window.localStorage.getItem("s4p.sponsor.profile");
          const parsed = raw
            ? (JSON.parse(raw) as { companyName?: string; email?: string })
            : null;
          const brandName = parsed?.companyName ?? "";
          if (!brandName) {
            router.replace(SPONSOR_LOGIN_PATH);
            return;
          }
          setListing(listingForBrand(brandName, parsed?.email));
          setRounds(invitesWaitingForBrand(brandName));
        } catch {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading invitations...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
            Invitation to Sponsor
          </p>
          <SponsorNav />
        </div>
        <h1 className="text-4xl font-black">Match Day invitations</h1>
        <p className="mt-3 text-slate-300">
          Club Sustainability Directors send these from the Sponsors listings.
          Global Brands compete on amount within 8 hours; Local Businesses
          receive a simple invite.
        </p>
        <div className="mt-8">
          {listing ? (
            <SponsorInviteInbox
              listing={listing}
              rounds={rounds}
              onRoundChange={(round) =>
                setRounds((current) =>
                  current.map((row) => (row.id === round.id ? round : row))
                )
              }
            />
          ) : (
            <p className="text-slate-400">
              Register as a Global Brand or Local Business Sponsor to appear on
              the Sponsors listings and receive invitations here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
