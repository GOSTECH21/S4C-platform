"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { registerSponsor } from "@/app/services/sponsor-auth.service";
import {
  ensureGoalNetwork,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import { ClubNetworkPicker } from "@/app/components/sponsor/ClubNetworkPicker";
import { BrandLogoField } from "@/app/components/sponsor/BrandLogoField";
import {
  LOCAL_SPONSOR_REGISTER_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";
import {
  continueAfterSponsorAuth,
  readPendingSponsorMatch,
} from "@/app/lib/pending-sponsor-match";
import { roleRegisterAccount } from "@/app/lib/role-login";
import { SafeInput, SafeSelect } from "@/app/components/forms/SafeFormField";
import {
  GLOBAL_MATCH_SPONSORSHIP_RANGES,
  MATCH_SPONSORSHIP_RANGE_LABEL,
  listingIdFor,
} from "@/app/lib/sponsor-listings";
import { registerSponsorListing } from "@/app/services/sponsor-listings.service";

export default function SponsorRegisterPage() {
  const account = roleRegisterAccount("sponsor");
  const [formReady, setFormReady] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [jobTitle, setJobTitle] = useState("Sponsorship Manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubNames, setClubNames] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [commitmentFeeRangeId, setCommitmentFeeRangeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormReady(true);
  }, []);

  useEffect(() => {
    if (!formReady) return;
    const pending = readPendingSponsorMatch();
    if (pending?.club) setClubNames((current) =>
      current.length ? current : [pending.club]
    );
  }, [formReady]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (clubNames.length === 0) {
      setError("Select at least one club whose Goals you want to sponsor.");
      setLoading(false);
      return;
    }
    if (!commitmentFeeRangeId) {
      setError(`Select your ${MATCH_SPONSORSHIP_RANGE_LABEL}.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerSponsor({
        companyName,
        contactName,
        jobTitle,
        email,
        password,
        logoDataUrl: logoUrl,
      });
      if (logoUrl) saveBrandLogo(companyName, logoUrl);
      ensureGoalNetwork({
        brandName: companyName,
        email,
        clubNames,
      });
      registerSponsorListing({
        id: listingIdFor("global", companyName, email),
        kind: "global",
        brandName: companyName,
        contactName,
        email,
        logoUrl,
        commitmentFeeRangeId,
        createdAt: new Date().toISOString(),
        source: "registered",
      });
      window.location.href =
        continueAfterSponsorAuth() || SPONSOR_DASHBOARD_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Brand / Sponsor
      </p>
      <h1 className="mt-3 text-4xl font-black">Register as Sponsor</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Create your Global Brand account, add your Match-Sponsorship Range,
            and you are listed on the club Sponsors section — nowhere else.
            Clubs invite you from that list.
          </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!formReady ? (
        <div
          className="mt-10 min-h-[28rem] rounded-xl border border-slate-800 bg-slate-800/40"
          aria-hidden
        />
      ) : (
      <form
        id={account.formId}
        autoComplete="off"
        onSubmit={handleRegister}
        className="mt-10 space-y-5"
      >
        <label className="block text-sm text-slate-400">
          Company / brand name
          <SafeInput
            type="text"
            id={account.organisationName}
            name={account.organisationName}
            autoComplete="off"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="Gillette UK"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Contact name
          <SafeInput
            type="text"
            id={account.contactName}
            name={account.contactName}
            autoComplete="off"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Role
          <SafeInput
            type="text"
            id={`${account.formId}-role`}
            name={`${account.formId}-role`}
            autoComplete="off"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Email
          <SafeInput
            type="email"
            id={account.emailName}
            name={account.emailName}
            autoComplete={account.emailAutoComplete}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Password
          <SafeInput
            type="password"
            id={account.passwordName}
            name={account.passwordName}
            autoComplete={account.passwordAutoComplete}
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
          onChange={(next) => {
            setLogoError(null);
            setLogoUrl(next);
          }}
        />
        <label className="block text-sm text-slate-400">
          {MATCH_SPONSORSHIP_RANGE_LABEL}
          <SafeSelect
            required
            value={commitmentFeeRangeId}
            onChange={(event) => setCommitmentFeeRangeId(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
          >
            <option value="">Select range</option>
            {GLOBAL_MATCH_SPONSORSHIP_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </SafeSelect>
        </label>
        <div>
          <p className="text-sm text-slate-400">
            Clubs whose Matches you would like to sponsor
          </p>
          <div className="mt-3">
            <ClubNetworkPicker
              selected={clubNames}
              onChange={setClubNames}
              compact
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register as Sponsor"}
        </button>
      </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href={SPONSOR_LOGIN_PATH} className="font-semibold text-green-400">
          Login
        </Link>
        {" · "}
        <Link href={LOCAL_SPONSOR_REGISTER_PATH} className="font-semibold text-green-400">
          Local Business instead?
        </Link>
      </p>
    </div>
  );
}
