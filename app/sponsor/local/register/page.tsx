"use client";

import { useState } from "react";
import Link from "next/link";
import { registerSponsor } from "@/app/services/sponsor-auth.service";
import {
  ensureGoalNetwork,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import { ClubNetworkPicker } from "@/app/components/sponsor/ClubNetworkPicker";
import { BrandLogoField } from "@/app/components/sponsor/BrandLogoField";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import {
  LOCAL_SPONSOR_MIN_GBP,
  writeLocalSponsorRecord,
} from "@/app/lib/local-sponsor";

export default function LocalSponsorRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [pledgeGbp, setPledgeGbp] = useState(String(LOCAL_SPONSOR_MIN_GBP));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const pledge = Number(pledgeGbp);
    if (!clubName) {
      setError("Choose the local club whose stadium your business is near.");
      return;
    }
    if (!Number.isFinite(pledge) || pledge < LOCAL_SPONSOR_MIN_GBP) {
      setError(
        `Local Business Climate Sponsors pay from £${LOCAL_SPONSOR_MIN_GBP}.`
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerSponsor({
        companyName,
        contactName,
        jobTitle: "Local Business Climate Sponsor",
        email,
        password,
        logoDataUrl: logoUrl,
        tier: "local",
        pledgeGbp: pledge,
        clubName,
      });
      if (logoUrl) saveBrandLogo(companyName, logoUrl);
      ensureGoalNetwork({
        brandName: companyName,
        email,
        clubNames: [clubName],
      });
      writeLocalSponsorRecord({
        brandName: companyName,
        email,
        clubName,
        pledgeGbp: pledge,
        createdAt: new Date().toISOString(),
        logoUrl,
        source: "registered",
      });
      window.location.href = SPONSOR_DASHBOARD_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Local Business Climate Sponsor
      </p>
      <h1 className="mt-3 text-4xl font-black">
        Register as a Local Sponsor
      </h1>
      <p className="mt-4 text-slate-300">
        From £{LOCAL_SPONSOR_MIN_GBP} your logo appears on one of the five
        Match Day Climate Project cards posted to fans. A £1,500 pledge receives
        three times the fan exposures of a £{LOCAL_SPONSOR_MIN_GBP} pledge, and
        takes a more prominent card — Global Schools Solar first.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="mt-10 space-y-5">
        <label className="block text-sm text-slate-400">
          Business name
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="The Stadium Cafe"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Contact name
          <input
            type="text"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Sponsorship from £{LOCAL_SPONSOR_MIN_GBP}
          <input
            type="number"
            min={LOCAL_SPONSOR_MIN_GBP}
            step={50}
            value={pledgeGbp}
            onChange={(event) => setPledgeGbp(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <BrandLogoField
          brandName={companyName}
          logoUrl={logoUrl}
          error={logoError}
          onChange={(next) => {
            setLogoError(null);
            setLogoUrl(next);
          }}
        />
        <div>
          <p className="text-sm text-slate-400">
            Local club (near the stadium)
          </p>
          <div className="mt-3">
            <ClubNetworkPicker
              selected={clubName ? [clubName] : []}
              onChange={(clubs) => setClubName(clubs[0] ?? "")}
              compact
              single
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Saving..." : `Confirm from £${LOCAL_SPONSOR_MIN_GBP}`}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href={SPONSOR_LOGIN_PATH} className="font-semibold text-green-400">
          Login
        </Link>
        {" · "}
        <Link href={SPONSOR_REGISTER_PATH} className="font-semibold text-green-400">
          National/Global instead?
        </Link>
      </p>
    </div>
  );
}
