"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_PATH,
} from "@/app/lib/routes";
import { storedFullName } from "@/app/lib/s4p-admin";

export default function AdminRegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const fullName = storedFullName(firstName, lastName);
    if (!fullName) {
      setError("Enter your first name and last name.");
      return;
    }
    setBusy(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: "admin",
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }
    const user = data.user;
    if (!user) {
      setError("Account created. Sign in with your staff email.");
      setBusy(false);
      return;
    }

    const profile = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "admin",
    });
    if (profile.error && profile.error.code === "23505") {
      await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
    } else if (profile.error) {
      setError(profile.error.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      window.location.href = ADMIN_PATH;
      return;
    }
    window.location.href = ADMIN_LOGIN_PATH;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P staff
        </p>
        <h1 className="mt-3 text-3xl font-bold">Register S4P staff</h1>
        <p className="mt-2 text-slate-400">
          Only authorized Score-For-Our-Planet staff should create an account
          here. Fans, clubs and sponsors use their own registration pages.
        </p>
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            className="w-full rounded-md bg-slate-800 p-3"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
          <input
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            className="w-full rounded-md bg-slate-800 p-3"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
          <input
            type="email"
            autoComplete="email"
            placeholder="Staff email"
            className="w-full rounded-md bg-slate-800 p-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            className="w-full rounded-md bg-slate-800 p-3"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:opacity-70"
          >
            {busy ? "Creating staff account..." : "Create staff account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have a staff account?{" "}
          <Link href={ADMIN_LOGIN_PATH} className="font-semibold text-green-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
