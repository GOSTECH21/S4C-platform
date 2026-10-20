"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import TeamPicker from "@/app/components/fan/TeamPicker";
import {
  loadFanRegisterCatalog,
  saveSupportedTeams,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import { storedFullName } from "@/app/lib/s4p-admin";
import {
  FAN_REGISTER_INTRO,
  FAN_REGISTER_TEAMS_COPY,
} from "@/app/lib/fan-register-copy";
import { captureClimateInviteFromSearch } from "@/app/lib/climate-funding";
import { roleRegisterAccount } from "@/app/lib/role-login";

function FanRegisterField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      suppressHydrationWarning
      autoCorrect="off"
      spellCheck={false}
      data-1p-ignore="true"
      data-lpignore="true"
      data-form-type="other"
    />
  );
}

export default function RegisterPage() {
  const account = roleRegisterAccount("fan");
  const [formReady, setFormReady] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [catalog, setCatalog] = useState<TeamGroup[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedClub, setInvitedClub] = useState<
    ReturnType<typeof captureClimateInviteFromSearch>
  >(null);

  useEffect(() => {
    setFormReady(true);
  }, []);

  useEffect(() => {
    if (!formReady) return;
    const invited = captureClimateInviteFromSearch();
    setInvitedClub(invited);
    loadFanRegisterCatalog()
      .then((next) => {
        setCatalog(next);
        if (!invited) return;
        const match = next
          .flatMap((group) =>
            group.competitions.flatMap((competition) => competition.teams)
          )
          .find(
            (team) =>
              team.displayName === invited.clubName ||
              team.name === invited.clubName
          );
        if (match) setTeams([match]);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load teams.")
      );
  }, [formReady]);

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

    const fullName = storedFullName(firstName, lastName);
    if (!fullName) {
      setError("Enter your first name and last name.");
      return;
    }

    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
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
        full_name: fullName,
        email: user.email,
        auth_user_id: user.id,
        favourite_club_id:
          uuidOrNull(teams[0]?.id) ?? uuidOrNull(invitedClub?.clubId),
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
      if (supporterId) {
        await supabase
          .from("supporters")
          .update({ full_name: fullName, email: user.email })
          .eq("id", supporterId);
      } else {
        setError(created.error.message);
        setBusy(false);
        return;
      }
    }

    try {
      if (teams.length > 0) {
        await saveSupportedTeams(user.id, supporterId, teams);
      }
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
    <main className="min-h-screen px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-xl bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P
        </p>
        <h1 className="mt-3 text-3xl font-bold">Fan registration</h1>
        <p className="mt-2 text-slate-400">
          {FAN_REGISTER_INTRO}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!formReady ? (
          <div
            className="mt-8 min-h-[32rem] rounded-xl border border-slate-800 bg-slate-800/40"
            aria-hidden
          />
        ) : (
          <form
            id={account.formId}
            autoComplete="off"
            onSubmit={handleRegister}
            className="mt-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FanRegisterField
                type="text"
                id={account.firstNameName}
                name={account.firstNameName}
                autoComplete="off"
                placeholder="First name"
                className="rounded-md bg-slate-800 p-3"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
              <FanRegisterField
                type="text"
                id={account.lastNameName}
                name={account.lastNameName}
                autoComplete="off"
                placeholder="Last name"
                className="rounded-md bg-slate-800 p-3"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
              <FanRegisterField
                type="email"
                id={account.emailName}
                name={account.emailName}
                autoComplete={account.emailAutoComplete}
                placeholder="Email"
                className="rounded-md bg-slate-800 p-3 md:col-span-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <FanRegisterField
                type="password"
                id={account.passwordName}
                name={account.passwordName}
                autoComplete={account.passwordAutoComplete}
                placeholder="Password"
                className="rounded-md bg-slate-800 p-3"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <FanRegisterField
                type="password"
                id={account.confirmName}
                name={account.confirmName}
                autoComplete={account.passwordAutoComplete}
                placeholder="Confirm password"
                className="rounded-md bg-slate-800 p-3"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <h2 className="mt-10 text-2xl font-bold">Teams you support</h2>
            <p className="mt-2 text-slate-300">
              {FAN_REGISTER_TEAMS_COPY}
            </p>

            <div className="mt-6">
              <TeamPicker
                catalog={catalog}
                selected={teams}
                onChange={setTeams}
                showScorePrice={false}
                openCompetitions={new Set()}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-8 w-full rounded-md bg-green-500 py-3 font-bold text-black disabled:opacity-70"
            >
              {busy ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

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

function uuidOrNull(value?: string | null): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}
