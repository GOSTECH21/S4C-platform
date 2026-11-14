"use client";
/* philanthropist-register-v1 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { registerSponsor } from "@/app/services/sponsor-auth.service";
import { ClubNetworkPicker } from "@/app/components/sponsor/ClubNetworkPicker";
import {
  PHILANTHROPIST_HOME_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import { roleRegisterAccount } from "@/app/lib/role-login";
import { SafeInput } from "@/app/components/forms/SafeFormField";
import {
  PHILANTHROPIST_JOB_TITLE,
  PHILANTHROPIST_KICKER,
  PHILANTHROPIST_REGISTER_COPY,
  PHILANTHROPIST_REGISTER_CTA,
  PHILANTHROPIST_REGISTER_HEADING,
  writePhilanthropistRecord,
} from "@/app/lib/philanthropist";

export default function PhilanthropistRegisterPage() {
  const account = roleRegisterAccount("philanthropist");
  const [formReady, setFormReady] = useState(false);
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [giftGbp, setGiftGbp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormReady(true);
  }, []);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    const gift = Number(giftGbp);
    if (!clubName.trim()) {
      setError("Select the club whose fans will direct your gift.");
      return;
    }
    if (!Number.isFinite(gift) || gift < 1) {
      setError("Enter a climate gift of at least £1 per match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const companyName = organisation.trim() || name.trim();
      await registerSponsor({
        companyName,
        contactName: name.trim(),
        jobTitle: PHILANTHROPIST_JOB_TITLE,
        email,
        password,
        clubName: clubName.trim(),
        pledgeGbp: gift,
      });
      writePhilanthropistRecord({
        name: name.trim(),
        organisation: organisation.trim(),
        email: email.trim(),
        clubName: clubName.trim(),
        giftGbp: gift,
        createdAt: new Date().toISOString(),
      });
      window.location.href = PHILANTHROPIST_HOME_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto max-w-3xl py-10"
      data-philanthropist-register="philanthropist-register-v1"
      data-testid="philanthropist-register"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        {PHILANTHROPIST_KICKER}
      </p>
      <h1 className="mt-3 text-4xl font-black">{PHILANTHROPIST_REGISTER_HEADING}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        {PHILANTHROPIST_REGISTER_COPY}
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
            Your name
            <SafeInput
              type="text"
              id={account.contactName}
              name={account.contactName}
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              required
            />
          </label>
          <label className="block text-sm text-slate-400">
            Foundation or organisation (optional)
            <SafeInput
              type="text"
              id={account.organisationName}
              name={account.organisationName}
              autoComplete="off"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
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
          <label className="block text-sm text-slate-400">
            Gift per match (£) — any amount
            <SafeInput
              type="number"
              id={`${account.formId}-gift`}
              name={`${account.formId}-gift`}
              min={1}
              step={1}
              inputMode="numeric"
              autoComplete="off"
              value={giftGbp}
              onChange={(event) => setGiftGbp(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              required
            />
          </label>
          <div>
            <p className="text-sm text-slate-400">
              The club whose fans will direct your gift
            </p>
            <div className="mt-3">
              <ClubNetworkPicker
                selected={clubName ? [clubName] : []}
                onChange={(clubs) => setClubName(clubs[0] ?? "")}
                single
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
          >
            {loading ? "Creating account..." : PHILANTHROPIST_REGISTER_CTA}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href={SPONSOR_LOGIN_PATH} className="font-semibold text-green-400">
          Login
        </Link>
        {" · "}
        <Link href={SPONSOR_REGISTER_PATH} className="font-semibold text-green-400">
          Lead Climate Sponsor instead?
        </Link>
      </p>
    </div>
  );
}
