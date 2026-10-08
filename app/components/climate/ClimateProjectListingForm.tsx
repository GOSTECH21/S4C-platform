"use client";

import { useEffect, useState, type ReactNode } from "react";
import { uploadPartnerProject } from "@/app/services/partner.service";
import {
  CIV_PERIODS,
  CIV_UNDERTAKING,
  CIV_VERIFICATION,
  DEFAULT_CIV_PERIOD,
  DEFAULT_PIP_DAYS,
  DEFAULT_PROJECT_LIFE_YEARS,
} from "@/app/lib/climate-impact-value";

const CATEGORIES = [
  "Solar Energy",
  "Renewable Energy",
  "Biodiversity",
  "Sustainable Agriculture",
  "Active Travel",
  "Recycling",
  "Ocean Cleanup",
  "Community Climate Action",
  "Resilience",
  "Education",
];

export function ClimateProjectListingForm({
  defaultCountry = "",
  defaultSignerName = "",
  heading = "Climate Project Form",
  intro = "Every Climate Project listed on S4P must have a Climate Impact Value (CIV), Funding Amount Sought, Project Implementation Period, the postcode or address where it is implemented, and a signed Climate Partner undertaking. Incomplete projects are not listed.",
  submitLabel = "Sign off and list on S4P",
  busyLabel = "Signing off...",
  accountSlot,
  beforeUpload,
  onListed,
}: {
  defaultCountry?: string;
  defaultSignerName?: string;
  heading?: string;
  intro?: string;
  submitLabel?: string;
  busyLabel?: string;
  accountSlot?: ReactNode;
  beforeUpload?: (listing: {
    country: string;
    signerName: string;
    name: string;
  }) => Promise<void>;
  onListed?: () => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Community Climate Action",
    country: defaultCountry,
    postcode: "",
    address: "",
    fundingAmountSought: "",
    projectedCiv: "",
    civPeriod: DEFAULT_CIV_PERIOD as string,
    projectLifeYears: String(DEFAULT_PROJECT_LIFE_YEARS),
    pipDays: String(DEFAULT_PIP_DAYS),
    methodology: "",
    evidence: "",
    verificationStatus: CIV_VERIFICATION[0] as string,
    signerName: defaultSignerName,
    undertakingSigned: false,
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      country: current.country || defaultCountry,
      signerName: current.signerName || defaultSignerName,
    }));
  }, [defaultCountry, defaultSignerName]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      if (beforeUpload) {
        await beforeUpload({
          country: form.country,
          signerName: form.signerName,
          name: form.name,
        });
      }
      await uploadPartnerProject({
        name: form.name,
        description: form.description,
        category: form.category,
        country: form.country,
        postcode: form.postcode,
        address: form.address,
        fundingAmountSought: Number(form.fundingAmountSought) || 0,
        projectedCiv: Number(form.projectedCiv) || 0,
        civPeriod: form.civPeriod,
        projectLifeYears: Number(form.projectLifeYears) || 0,
        pipDays: Number(form.pipDays) || 0,
        methodology: form.methodology,
        evidence: form.evidence,
        verificationStatus: form.verificationStatus,
        undertakingSigned: form.undertakingSigned,
        signerName: form.signerName,
      });
      setForm({
        name: "",
        description: "",
        category: form.category,
        country: form.country,
        postcode: "",
        address: "",
        fundingAmountSought: "",
        projectedCiv: "",
        civPeriod: DEFAULT_CIV_PERIOD,
        projectLifeYears: String(DEFAULT_PROJECT_LIFE_YEARS),
        pipDays: String(DEFAULT_PIP_DAYS),
        methodology: "",
        evidence: "",
        verificationStatus: CIV_VERIFICATION[0],
        signerName: form.signerName,
        undertakingSigned: false,
      });
      setNotice("Project signed off and listed on S4P. Sustainability Directors can now select it.");
      await onListed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list this Climate Project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="climate-project-form">
      <h2 className="text-2xl font-black">{heading}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">{intro}</p>
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300">
          {notice}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        {accountSlot}
        <label className="text-sm text-slate-400">
          Project
          <input
            required
            placeholder="e.g. School Rooftop Solar"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
          />
        </label>
        <label className="text-sm text-slate-400">
          Description
          <textarea
            required
            placeholder="What the project does and who it serves"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="mt-2 h-28 w-full rounded-lg bg-slate-800 p-4 text-white"
          />
        </label>
        <label className="text-sm text-slate-400">
          Category
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
            className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
          >
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Country
          <input
            required
            placeholder="Country"
            value={form.country}
            onChange={(event) =>
              setForm({ ...form, country: event.target.value })
            }
            className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-400">
            Postcode where the project is implemented
            <input
              required
              placeholder="e.g. EH7 5QG"
              value={form.postcode}
              onChange={(event) =>
                setForm({ ...form, postcode: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              autoComplete="postal-code"
            />
          </label>
          <label className="text-sm text-slate-400">
            Address / site of implementation
            <input
              required
              placeholder="Street, neighbourhood or venue"
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Fans of a club can put FUND-IT onto Climate Projects within 5 miles of
          that club&apos;s stadium postcode. Local Business Climate Sponsors
          must also trade within 5 miles of the stadium.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-400">
            Funding Amount Sought (£)
            <input
              required
              type="number"
              min={1}
              placeholder="10000"
              value={form.fundingAmountSought}
              onChange={(event) =>
                setForm({ ...form, fundingAmountSought: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
          <label className="text-sm text-slate-400">
            Projected Climate Impact Value (tCO2e/Yr)
            <input
              required
              type="number"
              min={0.01}
              step="any"
              placeholder="25"
              value={form.projectedCiv}
              onChange={(event) =>
                setForm({ ...form, projectedCiv: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
          <label className="text-sm text-slate-400">
            CIV period
            <select
              value={form.civPeriod}
              onChange={(event) =>
                setForm({ ...form, civPeriod: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            >
              {CIV_PERIODS.map((period) => (
                <option key={period}>{period}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Expected project life (years)
            <input
              required
              type="number"
              min={1}
              placeholder="20"
              value={form.projectLifeYears}
              onChange={(event) =>
                setForm({ ...form, projectLifeYears: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
          <label className="text-sm text-slate-400">
            Projected Implementation Period (Days after funding)
            <input
              required
              type="number"
              min={1}
              placeholder="90"
              value={form.pipDays}
              onChange={(event) =>
                setForm({ ...form, pipDays: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
          <label className="text-sm text-slate-400">
            Verification status
            <select
              value={form.verificationStatus}
              onChange={(event) =>
                setForm({ ...form, verificationStatus: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            >
              {CIV_VERIFICATION.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="text-sm text-slate-400">
          CIV methodology
          <input
            required
            placeholder="Solar generation × applicable emissions factor"
            value={form.methodology}
            onChange={(event) =>
              setForm({ ...form, methodology: event.target.value })
            }
            className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
          />
        </label>
        <label className="text-sm text-slate-400">
          Evidence (technical specification / baseline / calculations)
          <textarea
            required
            placeholder="Technical specification / baseline / calculations"
            value={form.evidence}
            onChange={(event) =>
              setForm({ ...form, evidence: event.target.value })
            }
            className="mt-2 h-24 w-full rounded-lg bg-slate-800 p-4 text-white"
          />
        </label>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
          <h3 className="text-lg font-black">Climate Partner sign-off</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{CIV_UNDERTAKING}</p>
          <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.undertakingSigned}
              onChange={(event) =>
                setForm({ ...form, undertakingSigned: event.target.checked })
              }
              className="mt-1"
              required
            />
            I sign off this Climate Project and give this undertaking to S4P.
          </label>
          <label className="mt-4 block text-sm text-slate-400">
            Signature (type your full name)
            <input
              required
              value={form.signerName}
              onChange={(event) =>
                setForm({ ...form, signerName: event.target.value })
              }
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 font-serif text-2xl text-white"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving || !form.undertakingSigned}
          className="rounded-xl bg-green-500 py-4 font-bold text-slate-950 disabled:opacity-70"
        >
          {saving ? busyLabel : submitLabel}
        </button>
      </form>
    </section>
  );
}
