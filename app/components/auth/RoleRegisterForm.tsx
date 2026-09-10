"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { HOME_PATH } from "@/app/lib/routes";

type RoleRegisterFormProps = {
  title: string;
  subtitle: string;
  role: string;
  loginHref: string;
};

export default function RoleRegisterForm({
  title,
  subtitle,
  role,
  loginHref,
}: RoleRegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegister() {
    if (busy) return;
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        role,
      });

      if (profileError) {
        console.error(profileError);
        setError(profileError.message);
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    setMessage("Registration successful. You can now log in.");
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

        {message && (
          <div className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
            {message}{" "}
            <Link href={loginHref} className="font-semibold underline">
              Login
            </Link>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="mt-6 mb-4 w-full rounded-md bg-slate-800 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-md bg-slate-800 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="mb-6 w-full rounded-md bg-slate-800 p-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRegister();
          }}
        />

        <button
          onClick={handleRegister}
          disabled={busy}
          className="w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-green-400 hover:underline">
            Login here
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
