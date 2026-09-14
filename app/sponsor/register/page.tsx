"use client";

import { useState } from "react";
import Link from "next/link";
import { registerSponsor } from "@/app/services/sponsor-auth.service";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";

export default function SponsorRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [jobTitle, setJobTitle] = useState("Sponsorship Manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await registerSponsor({
        companyName,
        contactName,
        jobTitle,
        email,
        password,
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
        Brand / Sponsor
      </p>
      <h1 className="mt-3 text-4xl font-black">Register as Sponsor</h1>
      <p className="mt-4 text-slate-300">
        Create your Sponsorship Manager account. After registration you can
        receive a club&apos;s 5 Climate Projects, or create your own list and
        send it to the Sustainability Director.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="mt-10 space-y-5">
        <label className="block text-sm text-slate-400">
          Company / brand name
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="Gillette UK"
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
          Role
          <input
            type="text"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register as Sponsor"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href={SPONSOR_LOGIN_PATH} className="font-semibold text-green-400">
          Login
        </Link>
      </p>
    </div>
  );
}
