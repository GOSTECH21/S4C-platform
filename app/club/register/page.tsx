"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { registerClubSustainabilityDirector } from "@/app/services/club-match-day.service";
import { CLUB_DASHBOARD_PATH } from "@/app/lib/routes";
import { SPORT_SELECT_OPTIONS } from "@/app/lib/sports";
import {
  clubRegisterCountries,
  clubRegisterLeaguesFor,
  leagueStillValidFor,
} from "@/app/lib/club-register-options";
import { roleRegisterAccount } from "@/app/lib/role-login";
import {
  bounceEmailOutOfPhone,
  clubRegisterStateKey,
} from "@/app/lib/club-register-contact";

const CLUB_REGISTER_FIELD_CLASS =
  "w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-base sm:p-4";
const CLUB_REGISTER_SELECT_CLASS =
  "w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-3 pr-8 text-base sm:py-4 sm:pl-4 sm:pr-10";
const CLUB_REGISTER_BACK_CLASS =
  "min-w-0 flex-1 rounded-xl border border-slate-700 px-4 py-3 text-center hover:bg-slate-800 sm:flex-none sm:px-8";
const CLUB_REGISTER_CONTINUE_CLASS =
  "min-w-0 flex-1 rounded-xl bg-green-500 px-3 py-3 text-center text-sm font-bold text-black hover:bg-green-400 sm:flex-none sm:px-8 sm:text-base";

export default function ClubRegistrationPage() {
  const account = roleRegisterAccount("club");
  const [formReady, setFormReady] = useState(false);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormReady(true);
  }, []);

  const [formData, setFormData] = useState({

    // STEP 1
    clubName: "",
    sport: "Football",
    league: "",
    country: "",
    website: "",

    // STEP 2
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: "",
password: "",
confirmPassword: "",

    // STEP 3
    stadium: "",
    supporterBase: "",
    attendance: "",
    sustainability: "",

    // STEP 4
    climateSponsorship: false,
    climateCredits: false,
    climateLeague: false,
    globalSchoolsSolar: false,

  });

  useEffect(() => {
    setFormData((prev) => bounceEmailOutOfPhone(prev));
  }, [formData.phone]);

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {

    const name = clubRegisterStateKey(e.target.name, account);
    const { value } = e.target;

    setFormData((prev) => {
      if (name === "phone" || name === "email") {
        const next = bounceEmailOutOfPhone({
          ...prev,
          [name]: value,
        });
        return next;
      }
      const next = { ...prev, [name]: value };
      if (name === "sport" || name === "country") {
        const leagues = clubRegisterLeaguesFor(
          name === "country" ? value : next.country,
          name === "sport" ? value : next.sport
        );
        if (leagueStillValidFor(next.league, next.country, next.sport)) {
          return next;
        }
        next.league = leagues.length === 1 ? leagues[0] : "";
      }
      return next;
    });

  };

  const handleCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

  };
  const submitRegistration = async () => {
    if (busy) return;
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setBusy(true);
    try {
      await registerClubSustainabilityDirector({
        clubName: formData.clubName,
        country: formData.country,
        website: formData.website,
        stadium: formData.stadium,
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        supporterBase: formData.supporterBase,
        attendance: formData.attendance,
        sustainability: formData.sustainability,
        climateSponsorship: formData.climateSponsorship,
        climateCredits: formData.climateCredits,
        climateLeague: formData.climateLeague,
        globalSchoolsSolar: formData.globalSchoolsSolar,
      });
      window.location.href = CLUB_DASHBOARD_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  };

  return (

    <main className="min-h-screen overflow-x-hidden text-white">

      <section
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-20"
        data-club-register-scale="club-register-mobile-scale-v1"
      >

        <p className="text-sm font-bold uppercase tracking-[0.16em] text-green-400 sm:text-base sm:tracking-[0.3em]">

          CLUB REGISTRATION

        </p>

        <h1 className="mt-4 text-3xl font-black sm:mt-6 sm:text-6xl">

          Register Your Club

        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:mt-8 sm:text-xl sm:leading-9">
          Join Score-4-Planet; turn every Sporting Moment (e.g a Goal
          Scored), into a Measurable Climate Impact Moment through
          Brands-led{" "}
          <span className="font-bold text-green-400">Climate Sponsorship</span>
          ; and offset your{" "}
          <span className="font-bold text-green-400">
            Match Day carbon footprint
          </span>
        </p>

        {/* Progress */}

        <div className="mt-8 sm:mt-12">

          <div className="mb-3 flex justify-between text-sm text-slate-400">

            <span>

              Step {step} of 5

            </span>

            <span>

              {step * 20}% Complete

            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-800">

            <div
              className="h-3 rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${step * 20}%`,
              }}
            />

          </div>

        </div>

        {!formReady ? (
        <div className="mt-8 min-h-[28rem] rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:mt-16 sm:p-10" />
        ) : (
        <form
          id={account.formId}
          className="mt-8 min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:mt-16 sm:p-10"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
            {/* ============================
    STEP 1
============================ */}

{step === 1 && (
  <>

    <h2 className="text-xl font-bold sm:text-3xl">

      Step 1 — Club Details

    </h2>

    <p className="mt-2 text-slate-400">

      Tell us about your club.

    </p>

    <div className="mt-6 grid min-w-0 gap-5 md:grid-cols-2 sm:mt-10 sm:gap-8">

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Club Name

        </label>

        <input
          suppressHydrationWarning
          type="text"
          name="clubName"
          value={formData.clubName}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Sport

        </label>

        <select
          suppressHydrationWarning
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          aria-label="Sport"
          className={CLUB_REGISTER_SELECT_CLASS}
        >

          {SPORT_SELECT_OPTIONS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}

        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Country

        </label>

        <select
          suppressHydrationWarning
          name="country"
          value={formData.country}
          onChange={handleChange}
          aria-label="Country"
          className={CLUB_REGISTER_SELECT_CLASS}
        >

          <option value="">Select the Country</option>
          {clubRegisterCountries().map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}

        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          League

        </label>

        <select
          suppressHydrationWarning
          name="league"
          value={formData.league}
          onChange={handleChange}
          aria-label="League"
          disabled={!formData.country}
          className={`${CLUB_REGISTER_SELECT_CLASS} disabled:opacity-50`}
        >

          <option value="">
            {formData.country
              ? "Select the League"
              : "Select a Country first"}
          </option>
          {clubRegisterLeaguesFor(formData.country, formData.sport).map(
            (league) => (
              <option key={league} value={league}>
                {league}
              </option>
            )
          )}

        </select>

      </div>

      <div className="md:col-span-2">

        <label className="mb-2 block text-sm text-slate-400">

          Official Club Website

        </label>

        <input
          suppressHydrationWarning
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
          placeholder="https://www.arsenal.com"
        />

      </div>

    </div>

  </>
)}

{/* ============================
    STEP 2
============================ */}

{step === 2 && (
  <>

    <h2 className="text-xl font-bold sm:text-3xl">

      Step 2 — Primary Club Representative

    </h2>

    <p className="mt-2 text-slate-400">

      Tell us who will manage your club's Score-4-Our-Planet account.

    </p>

    <div className="mt-6 grid min-w-0 gap-5 md:grid-cols-2 sm:mt-10 sm:gap-8">

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          First Name

        </label>

        <input
          suppressHydrationWarning
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Last Name

        </label>

        <input
          suppressHydrationWarning
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Job Title

        </label>

        <select
          suppressHydrationWarning
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        >

          <option value="">Select Job Title</option>

          <option>Commercial Director</option>

          <option>Marketing Director</option>

          <option>Sustainability Director</option>

          <option>Chief Executive Officer</option>

          <option>Community Director</option>

          <option>Other</option>

        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Phone Number

        </label>

        <input
          suppressHydrationWarning
          type="tel"
          inputMode="tel"
          id={account.phoneName}
          name={account.phoneName}
          autoComplete={account.phoneAutoComplete}
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
          aria-label="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Club Email

        </label>

        <input
          suppressHydrationWarning
          type="email"
          id={account.emailName}
          name={account.emailName}
          autoComplete="email"
          aria-label="Club Email"
          value={formData.email}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">
          Password
        </label>

        <input
          suppressHydrationWarning
          type="password"
          id={account.passwordName}
          name={account.passwordName}
          autoComplete={account.passwordAutoComplete}
          aria-label="Password"
          value={formData.password}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
          required
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">
          Confirm Password
        </label>

        <input
          suppressHydrationWarning
          type="password"
          id={account.confirmName}
          name={account.confirmName}
          autoComplete={account.passwordAutoComplete}
          aria-label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
          required
        />

      </div>

    </div>

  </>
)}
{/* ============================
    STEP 3
============================ */}

{step === 3 && (
  <>

    <h2 className="text-xl font-bold sm:text-3xl">
      Step 3 — Club Sustainability Profile
    </h2>

    <p className="mt-2 text-slate-400">
      Help us understand your club and its sustainability ambitions.
    </p>

    <div className="mt-6 grid min-w-0 gap-5 md:grid-cols-2 sm:mt-10 sm:gap-8">

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Home Stadium
        </label>

        <input
          suppressHydrationWarning
          type="text"
          name="stadium"
          value={formData.stadium}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Approximate Supporter Base
        </label>

        <select
          suppressHydrationWarning
          name="supporterBase"
          value={formData.supporterBase}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        >
          <option value="">Select</option>
          <option>Under 5,000</option>
          <option>5,000 - 50,000</option>
          <option>50,000 - 250,000</option>
          <option>250,000 - 1 Million</option>
          <option>Over 1 Million</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Average Home Attendance
        </label>

        <input
          suppressHydrationWarning
          type="text"
          name="attendance"
          value={formData.attendance}
          onChange={handleChange}
          className={CLUB_REGISTER_FIELD_CLASS}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Current Sustainability Initiatives
        </label>

        <textarea
          suppressHydrationWarning
          name="sustainability"
          value={formData.sustainability}
          onChange={handleChange}
          rows={5}
          className={CLUB_REGISTER_FIELD_CLASS}
        />
      </div>

    </div>

  </>
)}

{/* ============================
    STEP 4
============================ */}

{step === 4 && (
  <>

    <h2 className="text-xl font-bold sm:text-3xl">
      Step 4 — Climate Commitment
    </h2>

    <p className="mt-2 text-slate-400">
      Choose how your club wants to participate in the S4P ecosystem.
    </p>

    <div className="mt-6 space-y-5 sm:mt-10 sm:space-y-6">

      <label className="flex items-start gap-3 sm:items-center sm:gap-4">

        <input
          suppressHydrationWarning
          type="checkbox"
          name="climateSponsorship"
          checked={formData.climateSponsorship}
          onChange={handleCheckbox}
        />

        <span>
          Secure <strong>Climate Sponsorship</strong> from Global Brands
        </span>

      </label>

      <label className="flex items-start gap-3 sm:items-center sm:gap-4">

        <input
          suppressHydrationWarning
          type="checkbox"
          name="climateCredits"
          checked={formData.climateCredits}
          onChange={handleCheckbox}
        />

        <span>
          Reward supporters with
          <strong> Climate Credits</strong>
        </span>

      </label>

      <label className="flex items-start gap-3 sm:items-center sm:gap-4">

        <input
          suppressHydrationWarning
          type="checkbox"
          name="globalSchoolsSolar"
          checked={formData.globalSchoolsSolar}
          onChange={handleCheckbox}
        />

        <span>
          Support the
          <strong> Global Schools Solar Programme</strong>
        </span>

      </label>

      <label className="flex items-start gap-3 sm:items-center sm:gap-4">

        <input
          suppressHydrationWarning
          type="checkbox"
          name="climateLeague"
          checked={formData.climateLeague}
          onChange={handleCheckbox}
        />

        <span>
          Join the
          <strong> Climate Impact League Table</strong>
        </span>

      </label>

    </div>

  </>
)}
{/* ============================
    STEP 5
============================ */}

{step === 5 && (
  <>

    <h2 className="text-xl font-bold sm:text-3xl">
      Step 5 — Review & Submit
    </h2>

    <p className="mt-2 text-slate-400">
      Please review your club registration before submitting.
    </p>

    <div className="mt-6 space-y-5 rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:mt-10 sm:space-y-6 sm:p-8">

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">Club</span>
        <span className="min-w-0 break-words font-semibold">{formData.clubName || "-"}</span>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">Sport</span>
        <span className="min-w-0 break-words">{formData.sport}</span>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">Country</span>
        <span className="min-w-0 break-words">{formData.country || "-"}</span>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">League</span>
        <span className="min-w-0 break-words">{formData.league || "-"}</span>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">Representative</span>
        <span className="min-w-0 break-words">
          {formData.firstName} {formData.lastName}
        </span>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between">
        <span className="text-slate-400">Email</span>
        <span className="min-w-0 break-words">{formData.email || "-"}</span>
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
        <span className="text-slate-400">
          Climate Commitments
        </span>

        <div className="min-w-0 text-left text-green-400 sm:text-right">

          {formData.climateSponsorship && (
            <div>✓ Climate Sponsorship</div>
          )}

          {formData.climateCredits && (
            <div>✓ Climate Credits</div>
          )}

          {formData.globalSchoolsSolar && (
            <div>✓ Global Schools Solar Programme</div>
          )}

          {formData.climateLeague && (
            <div>✓ Climate Impact League Table</div>
          )}

        </div>

      </div>

    </div>

  </>
)}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

{/* ============================
    NAVIGATION
============================ */}

<div className="mt-8 flex gap-3 sm:mt-12 sm:justify-between">

  {step > 1 ? (

    <button
      suppressHydrationWarning
      type="button"
      onClick={previousStep}
      className={CLUB_REGISTER_BACK_CLASS}
    >
      ← Previous
    </button>

  ) : (

    <Link
      href="/club"
      className={CLUB_REGISTER_BACK_CLASS}
    >
      Back
    </Link>

  )}

  {step < 5 ? (

    <button
      suppressHydrationWarning
      type="button"
      onClick={nextStep}
      className={CLUB_REGISTER_CONTINUE_CLASS}
    >
      Continue →
    </button>

  ) : (

    <button
      suppressHydrationWarning
      type="button"
      onClick={submitRegistration}
      disabled={busy}
      className={`${CLUB_REGISTER_CONTINUE_CLASS} disabled:opacity-70`}
    >
      {busy ? "Opening your dashboard..." : "Complete Club Registration"}
    </button>

  )}

</div>

</form>
        )}

</section>

</main>

  );

}
