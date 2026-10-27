"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClubChosenProjectsPanel } from "@/app/components/sponsor/ClubChosenProjectsPanel";
import { StripeCardPayment } from "@/app/components/sponsor/StripeCardPayment";
import { LEAD_PAID_SECTION_ID } from "@/app/lib/lead-sponsor-home";
import {
  CARD_PAYMENT_CONFIRMED_COPY,
  PAY_WITH_CARD_LABEL,
  cardPaymentAmountGbp,
  isMatchDayCardPaymentConfirmed,
} from "@/app/lib/sponsor-card-payment";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_LOGIN_PATH,
  sponsorWalletPath,
} from "@/app/lib/routes";
import {
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import { climateWalletHeading } from "@/app/lib/match-day-carbon-offset";
import { displayLockFixture } from "@/app/lib/climate-sponsors";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import { loadMatchDayLock } from "@/app/services/climate-sponsors.service";
import { confirmMatchDayCardPayment } from "@/app/services/sponsor-card-payment.service";
import { readClimateWallet } from "@/app/services/sponsor-wallet.service";
import type { ClimateWallet } from "@/app/lib/sponsor-wallet";

export default function SponsorCardPaymentPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [clubName, setClubName] = useState("");
  const [kind, setKind] = useState<"lead" | "local">("lead");
  const [wallet, setWallet] = useState<ClimateWallet | null>(null);
  const [fixture, setFixture] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
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
        rememberLocalSponsorSession(sponsor);
        const jobTitle = String(sponsor.industry ?? "");
        const localKind = isLocalClimateSponsor(brandName, { jobTitle });
        const matchLock = loadMatchDayLock(brandName);
        const clubFromQuery =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("club")?.trim() ||
              ""
            : "";
        const club = matchLock?.clubName || clubFromQuery;
        setBrand(brandName);
        setKind(localKind ? "local" : "lead");
        setClubName(club);
        setFixture(matchLock ? displayLockFixture(matchLock) : "");
        if (club) {
          setWallet(readClimateWallet(club, brandName));
          setPaid(isMatchDayCardPaymentConfirmed({ clubName: club, brandName }));
        }
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const amountGbp = cardPaymentAmountGbp(wallet);
  const dashboardHref = kind === "local"
    ? LOCAL_SPONSOR_HOME_PATH
    : `${sponsorHomePath(brand)}#${LEAD_PAID_SECTION_ID}`;

  async function pay() {
    if (!clubName || !brand) {
      setError("Lock a club for this Match Day first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await confirmMatchDayCardPayment({
        brandName: brand,
        clubName,
        kind,
      });
      setPaid(true);
      setWallet(readClimateWallet(clubName, brand));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Opening card payment...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {kind === "local" ? "Local Business Climate Sponsor" : brand}
        </p>
        <h1 className="mt-2 text-4xl font-black">
          {paid ? CARD_PAYMENT_CONFIRMED_COPY : PAY_WITH_CARD_LABEL}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {climateWalletHeading({ clubName, fixtureName: fixture })}
          {amountGbp > 0 ? ` · ${formatWalletGbp(amountGbp)}` : ""}
        </p>
      </div>

      {clubName ? (
        <ClubChosenProjectsPanel
          clubName={clubName}
          approved={paid}
          confirmation
        />
      ) : null}

      {paid ? (
        <div className="rounded-3xl border border-green-500/40 bg-green-500/10 p-8">
          <p className="text-lg font-semibold text-green-300">
            {CARD_PAYMENT_CONFIRMED_COPY}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={dashboardHref}
              className="rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950"
            >
              Back to dashboard
            </Link>
            <Link
              href={sponsorWalletPath(clubName)}
              className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
            >
              View Climate Sponsorship Wallet
            </Link>
          </div>
        </div>
      ) : (
        <StripeCardPayment
          amountGbp={amountGbp}
          clubName={clubName}
          busy={busy}
          error={error}
          onPay={pay}
        />
      )}

      {!paid ? (
        <Link
          href={sponsorWalletPath(clubName)}
          className="inline-flex rounded-xl border border-slate-600 px-5 py-3 font-semibold"
        >
          Back to confirmation
        </Link>
      ) : null}
    </div>
  );
}
