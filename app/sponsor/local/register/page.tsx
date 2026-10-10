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
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
  SPONSOR_WALLET_PATH,
} from "@/app/lib/routes";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSOR_TERMS,
  writeLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { ensureLocalWallet } from "@/app/services/sponsor-wallet.service";

export default function LocalSponsorRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [pledgeGbp, setPledgeGbp] = useState(String(LOCAL_SPONSOR_MIN_GBP));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signerName, setSignerName] = useState("");
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
    if (!postcode.trim()) {
      setError("Enter all required registration info including business postcode.");
      return;
    }
    if (!Number.isFinite(pledge) || pledge < LOCAL_SPONSOR_MIN_GBP) {
      setError(
        `Local Business Climate Sponsors pay from £${LOCAL_SPONSOR_MIN_GBP}.`
      );
      return;
    }
    if (!acceptedTerms) {
      setError("Read and agree to the Score-4-Planet Terms & Conditions before you sign off.");
      return;
    }
    if (!signerName.trim()) {
      setError("Type your full name to sign off this Local Business Climate Sponsorship.");
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
        postcode: postcode.trim(),
        acceptedTerms: true,
        signerName: signerName.trim(),
        signedAt: new Date().toISOString(),
      });
      ensureLocalWallet({
        clubName,
        brandName: companyName,
        sponsorshipGbp: pledge,
      });
      window.location.href = SPONSOR_WALLET_PATH;
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
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-slate-300">
        <li>Enter all required registration info including business postcode</li>
        <li>Upload your business logo (if available)</li>
        <li>Select the Club you wish to sponsor</li>
        <li>read and agree to Score-4-Planet Terms & Conditions</li>
        <li>Sign & SUBMIT</li>
      </ol>

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
        <BrandLogoField
          brandName={companyName}
          logoUrl={logoUrl}
          error={logoError}
          label="Business logo"
          hint="Upload your business logo if available. Your business name and logo appear to fans who take £0.20 from your Carbon Wallet."
          onChange={(next) => {
            setLogoError(null);
            setLogoUrl(next);
          }}
        />
        <label className="block text-sm text-slate-400">
          Business postcode
          <input
            type="text"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="e.g. EH7 5AA"
            autoComplete="postal-code"
            required
          />
        </label>
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
        <label className="block text-sm text-slate-400">
          Match Day amount (from £{LOCAL_SPONSOR_MIN_GBP})
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
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-black text-white">
            Score-4-Planet Terms & Conditions
          </h2>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
            {LOCAL_SPONSOR_TERMS}
          </div>
          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1"
              required
            />
            I have read and agree to the Score-4-Planet Terms & Conditions.
          </label>
          <label className="block text-sm text-slate-400">
            Signature (type your full name)
            <input
              type="text"
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 font-serif text-2xl text-white"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !acceptedTerms || !signerName.trim()}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Submitting..." : "Sign & SUBMIT"}
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
