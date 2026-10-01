"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  depositLeadClimateWallet,
  readClimateWallet,
  topUpLocalClimateWallet,
} from "@/app/services/sponsor-wallet.service";
import {
  localRecordFromProfile,
  readLocalSponsorRecord,
  readSponsorTier,
  writeLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { loadMatchDayLock } from "@/app/services/climate-sponsors.service";
import { SPONSOR_DASHBOARD_PATH, SPONSOR_LOGIN_PATH } from "@/app/lib/routes";
import type { ClimateWallet } from "@/app/lib/sponsor-wallet";
import { remainingGbp, formatWalletGbp } from "@/app/lib/sponsor-wallet";

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
        const local = readLocalSponsorRecord() ?? localRecordFromProfile();
        const tier = readSponsorTier();
        const lock = loadMatchDayLock(brandName);
        const club = local?.clubName || lock?.clubName || "";
        setClubName(club);
        setKind(tier === "local" || Boolean(local) ? "local" : "lead");
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
          Top up this wallet so fans of {clubName || "your club"} can take cash
          from it and put that cash into a numbered Climate Project.
        </p>
      </div>

      <ClimateSponsorshipWallet
        kind={kind}
        wallet={wallet}
        clubName={clubName}
        busy={busy}
        error={error}
        notice={notice}
        onLocalTopUp={(sponsorshipGbp) => {
          if (!clubName || !brand) {
            setError("Lock a club or register as a local sponsor for a club first.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const next = topUpLocalClimateWallet({
              clubName,
              brandName: brand,
              sponsorshipGbp,
            });
            setWallet(next);
            const local = readLocalSponsorRecord() ?? localRecordFromProfile();
            if (local) {
              writeLocalSponsorRecord({
                ...local,
                pledgeGbp: next.sponsorshipGbp,
              });
            }
            setNotice(
              `${formatWalletGbp(next.sponsorshipGbp)} is now in the wallet (${formatWalletGbp(remainingGbp(next))} Remaining).`
            );
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not top up the wallet.");
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
            setWallet(next);
            setNotice(
              `Commitment Fee ${formatWalletGbp(next.commitmentFeeGbp)} is in the wallet (${formatWalletGbp(remainingGbp(next))} Remaining).`
            );
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the wallet.");
          } finally {
            setBusy(false);
          }
        }}
      />

      <button
        type="button"
        onClick={() => router.push(SPONSOR_DASHBOARD_PATH)}
        className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
      >
        Back to dashboard
      </button>
    </div>
  );
}
