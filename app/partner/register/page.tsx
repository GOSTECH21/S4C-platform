"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import Link from "next/link";
import { registerClimatePartner } from "@/app/services/partner.service";
import {
  HOME_PATH,
  PARTNER_DASHBOARD_PATH,
  PARTNER_LOGIN_PATH,
} from "@/app/lib/routes";
import { roleRegisterAccount } from "@/app/lib/role-login";
import { ClimateProjectListingForm } from "@/app/components/climate/ClimateProjectListingForm";

function FreshRegisterInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [locked, setLocked] = useState(true);
  return (
    <input
      {...props}
      readOnly={locked}
      data-1p-ignore="true"
      data-lpignore="true"
      data-form-type="other"
      onFocus={(event) => {
        setLocked(false);
        props.onFocus?.(event);
      }}
    />
  );
}

export default function PartnerRegisterPage() {
  const account = roleRegisterAccount("partner");
  const [organisationName, setOrganisationName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountReady, setAccountReady] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    setOrganisationName("");
    setContactName("");
    setEmail("");
    setWebsite("");
    setPassword("");
    setConfirmPassword("");
  }, []);

  async function createAccount(country: string, signerName: string) {
    setAccountError(null);
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    if (accountReady) return;
    await registerClimatePartner({
      organisationName,
      contactName: contactName || signerName,
      email,
      password,
      website,
      country,
    });
    setAccountReady(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Partner
        </p>
        <h1 className="mt-3 text-3xl font-black">List your Climate Project on S4P</h1>
        <p className="mt-3 text-slate-300">
          You are a Project Partner with a Climate Project to put on S4P. Create
          your account, then fill in the Climate Project Form, sign the
          undertaking and list it. Do not pick from a catalog — list the
          project you actually have. Sustainability Directors see listed
          projects after this sign-off.
        </p>

        {accountError && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {accountError}
          </div>
        )}

        <div className="mt-10">
          <ClimateProjectListingForm
            defaultSignerName={contactName}
            heading="Climate Project Form"
            intro="Complete every field, including Climate Impact Value, Funding Amount Sought, PIP, the postcode where the project is implemented, and the signed undertaking. S4P will not list the project until this form is signed off."
            submitLabel="Create account, sign off and list on S4P"
            busyLabel="Listing your project..."
            beforeUpload={async ({ country, signerName }) => {
              try {
                await createAccount(country, signerName);
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Could not register.";
                setAccountError(message);
                throw err;
              }
            }}
            onListed={() => {
              window.location.href = PARTNER_DASHBOARD_PATH;
            }}
            accountSlot={
              <div className="relative grid gap-4 border-b border-slate-800 pb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Your Climate Partner account
                </p>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                >
                  <input type="email" name="email" tabIndex={-1} autoComplete="username" />
                  <input
                    type="password"
                    name="password"
                    tabIndex={-1}
                    autoComplete="current-password"
                  />
                </div>
                <FreshRegisterInput
                  required
                  id={account.organisationName}
                  name={account.organisationName}
                  autoComplete="off"
                  placeholder="Organisation name"
                  value={organisationName}
                  onChange={(event) => setOrganisationName(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
                <FreshRegisterInput
                  required
                  id={account.contactName}
                  name={account.contactName}
                  autoComplete="off"
                  placeholder="Contact name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
                <FreshRegisterInput
                  required
                  type="email"
                  id={account.emailName}
                  name={account.emailName}
                  autoComplete={account.emailAutoComplete}
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
                <FreshRegisterInput
                  id={account.websiteName}
                  name={account.websiteName}
                  autoComplete="off"
                  placeholder="Website (optional)"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
                <FreshRegisterInput
                  required
                  type="password"
                  id={account.passwordName}
                  name={account.passwordName}
                  autoComplete={account.passwordAutoComplete}
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
                <FreshRegisterInput
                  required
                  type="password"
                  id={account.confirmName}
                  name={account.confirmName}
                  autoComplete={account.passwordAutoComplete}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg bg-slate-800 p-4 text-white"
                />
              </div>
            }
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link href={PARTNER_LOGIN_PATH} className="font-semibold text-green-400">
            Login
          </Link>
          {" · "}
          <Link href={HOME_PATH} className="hover:text-white">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
