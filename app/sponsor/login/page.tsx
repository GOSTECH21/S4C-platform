"use client";

import { useState } from "react";
import Link from "next/link";
import { loginSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  LOCAL_SPONSOR_REGISTER_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import { sponsorHomePath } from "@/app/lib/sponsor-home";
import { roleLoginAccount } from "@/app/lib/role-login";

export default function SponsorLoginPage() {
  const account = roleLoginAccount("sponsor");
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await loginSponsor({ email, password });
      const sponsor = await getCurrentSponsor();
      window.location.href = sponsorHomePath(String(sponsor.name ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Brand / Sponsor
      </p>
      <h1 className="mt-3 text-4xl font-black">Sponsor Login</h1>
      <p className="mt-4 text-slate-300">
        Sign in as Sponsorship Manager to receive a club&apos;s 5 Climate
        Projects or create your own campaign list.
      </p>
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <form
        id={account.formId}
        onSubmit={handleLogin}
        className="mt-10 space-y-5"
        autoComplete="on"
      >
        <label className="block text-sm text-slate-400">
          Email
          <input
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
          <input
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        New brand?{" "}
        <Link href={SPONSOR_REGISTER_PATH} className="font-semibold text-green-400">
          Register as a National/Global Sponsor
        </Link>
        {" or "}
        <Link href={LOCAL_SPONSOR_REGISTER_PATH} className="font-semibold text-green-400">
          a Local Business Climate Sponsor
        </Link>
      </p>
    </div>
  );
}
