"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClubRegistrationPage() {

  const [step, setStep] = useState(1);

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

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  const submitRegistration = () => {

    console.log("Club Registration");

    console.log(formData);

    alert(
      "Club registration complete. Next we will save this to Supabase."
    );

  };

  return (

    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-5xl px-8 py-20">

        <p className="font-bold uppercase tracking-[0.3em] text-green-400">

          CLUB REGISTRATION

        </p>

        <h1 className="mt-6 text-6xl font-black">

          Register Your Club

        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-slate-300">

          Join Score-4-Our-Planet and enable every sporting moment to
          generate measurable climate impact through
          <span className="font-bold text-green-400">
            {" "}Climate Sponsorship
          </span>,
          <span className="font-bold text-green-400">
            {" "}Climate Credits
          </span>
          {" "}and support for the
          <span className="font-bold text-green-400">
            {" "}Global Schools Solar Programme.
          </span>

        </p>

        {/* Progress */}

        <div className="mt-12">

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

        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900 p-10">
            {/* ============================
    STEP 1
============================ */}

{step === 1 && (
  <>

    <h2 className="text-3xl font-bold">

      Step 1 — Club Details

    </h2>

    <p className="mt-2 text-slate-400">

      Tell us about your football club.

    </p>

    <div className="mt-10 grid gap-8 md:grid-cols-2">

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Club Name

        </label>

        <input
          name="clubName"
          value={formData.clubName}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Sport

        </label>

        <select
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        >

          <option>Football</option>

          <option>Rugby</option>

          <option>Cricket</option>

          <option>Basketball</option>

        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          League

        </label>

        <input
          name="league"
          value={formData.league}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Country

        </label>

        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div className="md:col-span-2">

        <label className="mb-2 block text-sm text-slate-400">

          Official Club Website

        </label>

        <input
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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

    <h2 className="text-3xl font-bold">

      Step 2 — Primary Club Representative

    </h2>

    <p className="mt-2 text-slate-400">

      Tell us who will manage your club's Score-4-Our-Planet account.

    </p>

    <div className="mt-10 grid gap-8 md:grid-cols-2">

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          First Name

        </label>

        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Last Name

        </label>

        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Job Title

        </label>

        <select
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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

          Club Email

        </label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm text-slate-400">

          Phone Number

        </label>

        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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

    <h2 className="text-3xl font-bold">
      Step 3 — Club Sustainability Profile
    </h2>

    <p className="mt-2 text-slate-400">
      Help us understand your club and its sustainability ambitions.
    </p>

    <div className="mt-10 grid gap-8 md:grid-cols-2">

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Home Stadium
        </label>

        <input
          name="stadium"
          value={formData.stadium}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Approximate Supporter Base
        </label>

        <select
          name="supporterBase"
          value={formData.supporterBase}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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
          name="attendance"
          value={formData.attendance}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Current Sustainability Initiatives
        </label>

        <textarea
          name="sustainability"
          value={formData.sustainability}
          onChange={handleChange}
          rows={5}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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

    <h2 className="text-3xl font-bold">
      Step 4 — Climate Commitment
    </h2>

    <p className="mt-2 text-slate-400">
      Choose how your club wants to participate in the S4P ecosystem.
    </p>

    <div className="mt-10 space-y-6">

      <label className="flex items-center gap-4">

        <input
          type="checkbox"
          name="climateSponsorship"
          checked={formData.climateSponsorship}
          onChange={handleCheckbox}
        />

        <span>
          Secure <strong>Climate Sponsorship</strong> from Global Brands
        </span>

      </label>

      <label className="flex items-center gap-4">

        <input
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

      <label className="flex items-center gap-4">

        <input
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

      <label className="flex items-center gap-4">

        <input
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

    <h2 className="text-3xl font-bold">
      Step 5 — Review & Submit
    </h2>

    <p className="mt-2 text-slate-400">
      Please review your club registration before submitting.
    </p>

    <div className="mt-10 space-y-6 rounded-2xl border border-slate-700 bg-slate-950 p-8">

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">Club</span>
        <span className="font-semibold">{formData.clubName || "-"}</span>
      </div>

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">Sport</span>
        <span>{formData.sport}</span>
      </div>

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">League</span>
        <span>{formData.league || "-"}</span>
      </div>

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">Country</span>
        <span>{formData.country || "-"}</span>
      </div>

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">Representative</span>
        <span>
          {formData.firstName} {formData.lastName}
        </span>
      </div>

      <div className="flex justify-between border-b border-slate-800 pb-4">
        <span className="text-slate-400">Email</span>
        <span>{formData.email || "-"}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-400">
          Climate Commitments
        </span>

        <div className="text-right text-green-400">

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

{/* ============================
    NAVIGATION
============================ */}

<div className="mt-12 flex justify-between">

  {step > 1 ? (

    <button
      onClick={previousStep}
      className="rounded-xl border border-slate-700 px-8 py-3 hover:bg-slate-800"
    >
      ← Previous
    </button>

  ) : (

    <Link
      href="/club"
      className="rounded-xl border border-slate-700 px-8 py-3 hover:bg-slate-800"
    >
      Back
    </Link>

  )}

  {step < 5 ? (

    <button
      onClick={nextStep}
      className="rounded-xl bg-green-500 px-8 py-3 font-bold text-black hover:bg-green-400"
    >
      Continue →
    </button>

  ) : (

    <button
      onClick={submitRegistration}
      className="rounded-xl bg-green-500 px-8 py-3 font-bold text-black hover:bg-green-400"
    >
      Complete Club Registration
    </button>

  )}

</div>

</div>

</section>

</main>

  );

}
