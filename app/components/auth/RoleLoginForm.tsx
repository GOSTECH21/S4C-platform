"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { HOME_PATH } from "@/app/lib/routes";

type RoleLoginFormProps = {
  title: string;
  subtitle: string;
  destination: string;
  registerHref: string;
};

export default function RoleLoginForm({
  title,
  subtitle,
  destination,
  registerHref,
}: RoleLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    window.location.href = destination;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P
        </p>
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-400">{subtitle}</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="mb-4 w-full rounded-md bg-slate-800 p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            className="mb-6 w-full rounded-md bg-slate-800 p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-green-400 hover:underline"
          >
            Register here
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-slate-500">
          <Link href={HOME_PATH} className="hover:text-slate-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
