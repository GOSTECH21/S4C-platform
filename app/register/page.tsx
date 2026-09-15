"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import TeamPicker from "@/app/components/fan/TeamPicker";
import {
  getTeamCatalog,
  saveSupportedTeams,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import { CURRENT_SEASON } from "@/app/lib/current-season";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [catalog, setCatalog] = useState<TeamGroup[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeamCatalog()
      .then(setCatalog)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load teams.")
      );
  }, []);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (teams.length === 0) {
      setError("Select at least one team you want to support.");
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

    const user = data.user;
    if (!user) {
      setError("Registration succeeded, but no user was returned. Please log in.");
      setBusy(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "supporter",
    });
    if (profileError && profileError.code !== "23505") {
      setError(profileError.message);
      setBusy(false);
      return;
    }

    const created = await supabase
      .from("supporters")
      .insert({
        full_name: email.split("@")[0] ?? "Supporter",
        email: user.email,
        auth_user_id: user.id,
        favourite_club_id: teams[0].id,
        notification_enabled: true,
      })
      .select("id")
      .single();

    let supporterId = created.data?.id as string | undefined;
    if (created.error) {
      const existing = await supabase
        .from("supporters")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      supporterId = existing.data?.id;
      if (!supporterId) {
        setError(created.error.message);
        setBusy(false);
        return;
      }
    }

    try {
      await saveSupportedTeams(user.id, supporterId, teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your teams.");
      setBusy(false);
      return;
    }

    if (data.session) {
      window.location.href = SUPPORTER_CAMPAIGN_PATH;
      return;
    }

    window.location.href = FAN_LOGIN_PATH;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-xl bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P
        </p>
        <h1 className="mt-3 text-3xl font-bold">Fan registration</h1>
        <p className="mt-2 text-slate-400">
          Create your account and choose the teams you support across the four
          sports categories: Football (Goal scored), Rugby (Try scored), NFL
          (Touchdown scored) and NBA (3-Point Score Sponsorship). You will only
          see sponsored climate projects when those teams are playing — and you
          will get a match-day alert when a sponsored match is live.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              className="rounded-md bg-slate-800 p-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              className="rounded-md bg-slate-800 p-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm password"
              className="rounded-md bg-slate-800 p-3"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <h2 className="mt-10 text-2xl font-bold">Teams you support</h2>
          <p className="mt-2 text-slate-300">
            Pick from the current {CURRENT_SEASON} season — not last season.
            Relegated clubs such as West Ham United, Burnley and Wolves now sit
            in the EFL Championship, so they cannot appear as Premier League
            opponents (Arsenal cannot play West Ham in the league this season).
            A Goal for Arsenal, a Try for Scotland, a Touchdown for the
            Patriots or a 3-Point for an NBA team each releases the sponsor
            amount agreed for that match (for example £10,000/Goal). Examples:
            Arsenal (Premier League), Hearts of Midlothian FC (Scottish
            Premiership), Scotland (Six Nations Rugby), New England Patriots
            (NFL) and Boston Celtics (NBA).
          </p>

          <div className="mt-6">
            <TeamPicker catalog={catalog} selected={teams} onChange={setTeams} />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-8 w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:opacity-70"
          >
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href={FAN_LOGIN_PATH} className="font-semibold text-green-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}
