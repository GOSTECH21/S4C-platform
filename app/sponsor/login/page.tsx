"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  HOME_PATH,
  LOCAL_SPONSOR_REGISTER_PATH,
  PHILANTHROPIST_REGISTER_PATH,
  SPONSOR_REGISTER_PATH,
  localSponsorLoginPath,
  localSponsorRegisterPath,
  sponsorRegisterPath,
} from "@/app/lib/routes";
import { continueAfterSponsorAuth } from "@/app/lib/pending-sponsor-match";
import {
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import { hydratePhilanthropistRecord } from "@/app/lib/philanthropist";
import { hydrateLocalSponsorRecords } from "@/app/services/local-sponsor.service";
import { inviteCountWaitingForBrand } from "@/app/services/sponsor-listings.service";
import { roleLoginAccount } from "@/app/lib/role-login";

const LOCAL_BUSINESS_LOGIN_KICKER = "Local Business Sponsor";
const LOCAL_BUSINESS_LOGIN_INTRO =
  "Sign in as Local Business Climate Sponsor to receive a Partner Club's 5 Climate Project.";

function SponsorLoginForm({ asLocal }: { asLocal: boolean }) {
  const account = roleLoginAccount("sponsor");
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerNationalHref, setRegisterNationalHref] = useState(
    SPONSOR_REGISTER_PATH
  );
  const [registerLocalHref, setRegisterLocalHref] = useState(
    LOCAL_SPONSOR_REGISTER_PATH
  );
  const [signedInLocal, setSignedInLocal] = useState(false);
  const showLocal = asLocal || signedInLocal;

  useEffect(() => {
    const next = continueAfterSponsorAuth();
    setRegisterNationalHref(sponsorRegisterPath(next));
    setRegisterLocalHref(localSponsorRegisterPath(next));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sponsor = await getCurrentSponsor();
        if (cancelled) return;
        setSignedInLocal(
          isLocalClimateSponsor(String(sponsor.name ?? ""), {
            jobTitle: String(sponsor.industry ?? ""),
          })
        );
      } catch {
        if (!cancelled) setSignedInLocal(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await loginSponsor({ email, password });
      const sponsor = await getCurrentSponsor();
      const brandName = String(sponsor.name ?? "");
      const jobTitle = String(sponsor.industry ?? "");
      await hydrateLocalSponsorRecords({
        brandName,
        email,
        sponsor,
      });
      hydratePhilanthropistRecord({
        ...sponsor,
        email,
      });
      rememberLocalSponsorSession(sponsor);
      const pendingMatch = continueAfterSponsorAuth();
      if (pendingMatch) {
        window.location.href = pendingMatch;
      } else if (isLocalClimateSponsor(brandName, { jobTitle })) {
        window.location.href = localSponsorLoginPath(
          inviteCountWaitingForBrand(brandName)
        );
      } else {
        window.location.href = sponsorHomePath(brandName, { jobTitle });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        {showLocal ? LOCAL_BUSINESS_LOGIN_KICKER : "Brand / Sponsor"}
      </p>
      <h1 className="mt-3 text-4xl font-black">Sponsor Login</h1>
      <p className="mt-4 text-slate-300">
        {showLocal
          ? LOCAL_BUSINESS_LOGIN_INTRO
          : "Sign in as Sponsorship Manager to receive a club's 5 Climate Projects or create your own campaign list."}
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
        <Link href={registerNationalHref} className="font-semibold text-green-400">
          Register as a National/Global Sponsor
        </Link>
        {" or "}
        <Link href={registerLocalHref} className="font-semibold text-green-400">
          a Local Business Climate Sponsor
        </Link>
        {" or "}
        <Link href={PHILANTHROPIST_REGISTER_PATH} className="font-semibold text-green-400">
          a Philanthropist
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link
          href={HOME_PATH}
          data-testid="back-to-home-inline"
          className="inline-flex items-center justify-center rounded-lg border border-s4p-mark bg-s4p-mark px-4 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

function SponsorLoginWithSearch() {
  const searchParams = useSearchParams();
  return (
    <SponsorLoginForm asLocal={searchParams.get("as") === "local"} />
  );
}

export default function SponsorLoginPage() {
  return (
    <Suspense fallback={<SponsorLoginForm asLocal={false} />}>
      <SponsorLoginWithSearch />
    </Suspense>
  );
}
