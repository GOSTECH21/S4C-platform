"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { destinationForRole, SUPPORTER_CAMPAIGN_PATH } from "../lib/routes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch(SUPPORTER_CAMPAIGN_PATH);

    let cancelled = false;

    async function bounceIfAlreadySignedIn() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;
      const href = await resolveDestination(session.user.id);
      if (!cancelled) router.replace(href);
    }

    bounceIfAlreadySignedIn();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogin() {
    if (busy) return;
    setBusy(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    // Navigate immediately. Role lookup is best-effort and must never
    // leave the fan stuck on this page after a successful sign-in.
    const href = await resolveDestination(data.user?.id);
    router.replace(href);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-green-400">Login</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-md bg-slate-800 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-md bg-slate-800 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <button
          onClick={handleLogin}
          disabled={busy}
          className="w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-green-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}

async function resolveDestination(userId: string | undefined): Promise<string> {
  if (!userId) return SUPPORTER_CAMPAIGN_PATH;

  try {
    const result = await Promise.race([
      supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2000)
      ),
    ]);
    return destinationForRole(result.data?.role);
  } catch {
    return SUPPORTER_CAMPAIGN_PATH;
  }
}
