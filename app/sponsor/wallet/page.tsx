"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  depositLeadClimateWallet,
  depositLocalClimateWallet,
  readClimateWallet,
} from "@/app/services/sponsor-wallet.service";
import {
  clubNameForLocalBrand,
  localRecordFromProfile,
  readLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { DEMO_CLUB_NAMES } from "@/app/lib/current-season";
import {
  bindFundedSponsorToClub,
  ensureGoalNetwork,
  loadMatchDayLock,
  lockWalletFundingToClub,
} from "@/app/services/climate-sponsors.service";
import {
  SPONSOR_LOGIN_PATH,
  sponsorDashboardReceivePath,
} from "@/app/lib/routes";
import {
  isLeadSponsorHome,
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import type { ClimateWallet } from "@/app/lib/sponsor-wallet";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";

export default function SponsorWalletPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [clubName, setClubName] = useState("");
  const [kind, setKind] = useState<"lead" | "local">("lead");
  const [wallet, setWallet] = useState<ClimateWallet | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
        if (!brandName) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setBrand(brandName);
        rememberLocalSponsorSession(sponsor);
        const jobTitle = String(sponsor.industry ?? "");
        const local = readLocalSponsorRecord() ?? localRecordFromProfile();
        const localForBrand =
          local &&
          local.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
            ? local
            : null;
        const lock = loadMatchDayLock(brandName);
        const club =
          localForBrand?.clubName ||
          clubNameForLocalBrand(brandName) ||
          lock?.clubName ||
          "";
        setClubName(club);
        setKind(
          isLocalClimateSponsor(brandName, { jobTitle }) ? "local" : "lead"
        );
        if (club) setWallet(readClimateWallet(club, brandName));
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    if (!clubName || !brand) return;
    function refreshWallet() {
      setWallet(readClimateWallet(clubName, brand));
    }
    window.addEventListener(SPONSORED_GOAL_EVENT, refreshWallet);
    window.addEventListener("storage", refreshWallet);
    return () => {
      window.removeEventListener(SPONSORED_GOAL_EVENT, refreshWallet);
      window.removeEventListener("storage", refreshWallet);
    };
  }, [clubName, brand]);

  if (loading) {
    return <p className="text-slate-400">Loading Climate Sponsorship Wallet...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {brand}
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Sponsorship Wallet</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {kind === "local"
            ? "Put how much you are sponsoring into this Carbon Wallet. Fans take that cash onto local Climate Projects. Goal-scored sponsorship is only for Lead Climate Sponsors."
            : `Fans of ${clubName || "your club"} take cash from this wallet and put that cash into a numbered Climate Project.`}
        </p>
      </div>

      {kind === "local" && !clubName ? (
        <label className="block max-w-md text-sm text-slate-400">
          Club
          <select
            value={clubName}
            onChange={(event) => {
              const nextClub = event.target.value;
              setClubName(nextClub);
              if (nextClub && brand) {
                setWallet(readClimateWallet(nextClub, brand));
              }
            }}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
          >
            <option value="">Choose the club this business supports</option>
            {DEMO_CLUB_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <ClimateSponsorshipWallet
        kind={kind}
        wallet={wallet}
        clubName={clubName}
        busy={busy}
        error={error}
        notice={notice}
        onLocalDeposit={(input) => {
          if (!clubName || !brand) {
            setError("Choose the club this Local Business Climate Sponsor supports.");
            return;
          }
          if (!(Number(input.sponsorshipGbp) > 0)) {
            setError("Enter how much you are putting into this Carbon Wallet.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const next = depositLocalClimateWallet({
              clubName,
              brandName: brand,
              sponsorshipGbp: input.sponsorshipGbp,
            });
            setWallet(next);
            setNotice(
              `${formatWalletGbp(next.sponsorshipGbp)} is in the Carbon Wallet for ${clubName} (${formatWalletGbp(next.paidGbp)} paid including the 10% management fee).`
            );
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Could not update the wallet."
            );
          } finally {
            setBusy(false);
          }
        }}
        onLeadDeposit={(input) => {
          if (!clubName || !brand) {
            setError("Lock a club for this Match Day first.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const next = depositLeadClimateWallet({
              clubName,
              brandName: brand,
              ...input,
            });
            lockWalletFundingToClub({
              brandName: brand,
              clubName,
              commitmentFeeGbp: next.commitmentFeeGbp,
              gbpPerGoal: next.gbpPerGoal,
              maximumSponsorshipGbp: next.maximumSponsorshipGbp,
            });
            ensureGoalNetwork({
              brandName: brand,
              clubNames: [clubName],
            });
            bindFundedSponsorToClub({
              clubName,
              brandName: brand,
              spentGbp: next.commitmentFeeGbp,
            });
            setWallet(next);
            setNotice(
              `Commitment Fee ${formatWalletGbp(next.commitmentFeeGbp)} is locked in for ${clubName}.`
            );
            if (isLeadSponsorHome(brand)) {
              router.push(sponsorDashboardReceivePath());
              return;
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the wallet.");
          } finally {
            setBusy(false);
          }
        }}
      />

      {isLeadSponsorHome(brand) ? (
        <button
          type="button"
          onClick={() => router.push(sponsorHomePath(brand))}
          className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
        >
          Back to dashboard
        </button>
      ) : null}
    </div>
  );
}
