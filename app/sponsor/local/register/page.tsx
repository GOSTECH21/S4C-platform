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
import { MatchSponsorshipPicker } from "@/app/components/sponsor/MatchSponsorshipPicker";
import {
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
  SPONSOR_WALLET_PATH,
} from "@/app/lib/routes";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSOR_TERMS,
  writeLocalSponsorRecord,
  type LocalMatchSponsorship,
} from "@/app/lib/local-sponsor";
import {
  assertLocalBusinessNearStadium,
  localBusinessNearStadiumMessage,
  stadiumSiteForClub,
} from "@/app/lib/project-site";
import { ensureLocalWallet } from "@/app/services/sponsor-wallet.service";

export default function LocalSponsorRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMatch(fixtureName: string) {
    setSelectedMatches((current) =>
      current.includes(fixtureName)
        ? current.filter((name) => name !== fixtureName)
        : [...current, fixtureName]
    );
    setAmounts((current) => ({
      ...current,
      [fixtureName]: current[fixtureName] ?? String(LOCAL_SPONSOR_MIN_GBP),
    }));
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (!clubName) {
      setError("Choose the local club whose stadium your business is near.");
      return;
    }
    try {
      assertLocalBusinessNearStadium({ postcode, clubName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter a nearby business postcode.");
      return;
    }
    if (selectedMatches.length === 0) {
      setError("Select the Match or Matches you wish to sponsor.");
      return;
    }
    if (!acceptedTerms) {
      setError("Read and agree to the Terms and Conditions before you sign off.");
      return;
    }
    if (!signerName.trim()) {
      setError("Type your full name to sign off this Local Business Climate Sponsorship.");
      return;
    }
    const matchSponsorships: LocalMatchSponsorship[] = [];
    for (const fixtureName of selectedMatches) {
      const amount = Number(amounts[fixtureName]);
      if (!Number.isFinite(amount) || amount < LOCAL_SPONSOR_MIN_GBP) {
        setError(
          `Enter at least £${LOCAL_SPONSOR_MIN_GBP} for each selected Match.`
        );
        return;
      }
      matchSponsorships.push({ fixtureName, amountGbp: amount });
    }
    const pledge = matchSponsorships.reduce(
      (sum, row) => sum + row.amountGbp,
      0
    );
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
        matchSponsorships,
        submittedAt: new Date().toISOString(),
        acceptedTerms: true,
        signerName: signerName.trim(),
        signedAt: new Date().toISOString(),
        postcode: postcode.trim(),
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
      <p className="mt-4 text-slate-300">
        {`Enter all required registration info including business postcode; Upload your business logo (if available); Select the Club you wish to sponsor: read and agree to Score-4-Planet Terms & Conditions; Sign & SUBMIT`}
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
        <BrandLogoField
          brandName={companyName}
          logoUrl={logoUrl}
          error={logoError}
          hint="Upload your business logo if available. Your business name and logo appear to fans who take £0.20 from your Carbon Wallet."
          onChange={(next) => {
            setLogoError(null);
            setLogoUrl(next);
          }}
        />
        <div>
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
        <p className="text-xs text-slate-500">
          {clubName
            ? localBusinessNearStadiumMessage(clubName)
            : "Local businesses must trade within 5 miles of the club stadium postcode."}
          {stadiumSiteForClub(clubName)
            ? ` Stadium postcode ${stadiumSiteForClub(clubName)?.postcode}.`
            : ""}
        </p>
          <p className="text-sm text-slate-400">
            Local club (near the stadium)
          </p>
          <div className="mt-3">
            <ClubNetworkPicker
              selected={clubName ? [clubName] : []}
              onChange={(clubs) => {
                const next = clubs[0] ?? "";
                setClubName(next);
                setSelectedMatches([]);
                setAmounts({});
              }}
              compact
              single
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400">
            Select the Match / Matches you wish to sponsor
          </p>
          <div className="mt-3">
            <MatchSponsorshipPicker
              clubName={clubName}
              selected={selectedMatches}
              amounts={amounts}
              onToggle={toggleMatch}
              onAmount={(fixtureName, amount) =>
                setAmounts((current) => ({ ...current, [fixtureName]: amount }))
              }
            />
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-black text-white">
            Terms and Conditions and sign-off
          </h2>
          <p className="text-sm text-slate-300">
            Terms and Conditions apply. Sign off this Local Business Climate
            Sponsorship before you SUBMIT it for the club Sustainability
            Director.
          </p>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
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
            I have read and agree to the Terms and Conditions.
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
          disabled={
            loading || !acceptedTerms || !signerName.trim()
          }
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Submitting..." : "SUBMIT sponsorship"}
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
