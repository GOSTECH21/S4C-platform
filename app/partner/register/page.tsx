"use client";

import { useState } from "react";
import Link from "next/link";
import { registerClimatePartner } from "@/app/services/partner.service";
import {
  HOME_PATH,
  PARTNER_DASHBOARD_PATH,
  PARTNER_LOGIN_PATH,
} from "@/app/lib/routes";
import { SCCAN_PARTNER_NAME, SCCAN_SOURCE_URL } from "@/app/lib/sccan-catalog";

export default function PartnerRegisterPage() {
  const [organisationName, setOrganisationName] = useState(SCCAN_PARTNER_NAME);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(SCCAN_SOURCE_URL);
  const [country, setCountry] = useState("Scotland");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await registerClimatePartner({
        organisationName,
        contactName,
        email,
        password,
        website,
        country,
      });
      window.location.href = PARTNER_DASHBOARD_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Partner
        </p>
        <h1 className="mt-3 text-3xl font-black">Register your climate programme</h1>
        <p className="mt-3 text-slate-300">
          Upload verified climate projects so Sustainability Directors can choose
          five for match day, then invite brands to sponsor Goals before fans
          vote. The MVP demo catalog is drawn from{" "}
          <a href={SCCAN_SOURCE_URL} className="text-green-400 underline">
            sccan.scot
          </a>
          .
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <input
            required
            placeholder="Organisation name"
            value={organisationName}
            onChange={(event) => setOrganisationName(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            required
            placeholder="Contact name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            placeholder="Website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            placeholder="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <input
            required
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 disabled:opacity-70"
          >
            {busy ? "Creating account..." : "Create Climate Partner account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link href={PARTNER_LOGIN_PATH} className="font-semibold text-green-400">
            Login
          </Link>
          {" · "}
          <Link href={HOME_PATH} className="hover:text-white">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
