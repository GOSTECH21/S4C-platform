"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { destinationForRole, FAN_REGISTER_PATH } from "@/app/lib/routes";
import { roleLoginAccount } from "@/app/lib/role-login";

export default function LoginPage() {
  const account = roleLoginAccount("fan");
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setBusy(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").single();

    window.location.href = destinationForRole(profile?.role);
  }

  return (
    <main className="flex min-h-screen items-center justify-center text-white">
      <div className="w-full max-w-md rounded-xl border border-emerald-400/25 bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-green-400">Login</h1>

        <form id={account.formId} onSubmit={handleLogin} autoComplete="on">
          <input
            type="email"
            id={account.emailName}
            name={account.emailName}
            autoComplete={account.emailAutoComplete}
            placeholder="Email"
            className="mb-4 w-full rounded-md border border-emerald-400/20 bg-slate-800 p-3 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            id={account.passwordName}
            name={account.passwordName}
            autoComplete={account.passwordAutoComplete}
            placeholder="Password"
            className="mb-6 w-full rounded-md border border-emerald-400/20 bg-slate-800 p-3 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:opacity-70"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href={FAN_REGISTER_PATH}
            className="font-semibold text-green-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
