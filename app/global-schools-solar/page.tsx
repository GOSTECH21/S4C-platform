import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import { FEATURED_GLOBAL_SCHOOLS_SOLAR } from "@/app/lib/sccan-catalog";
import { UK_CLIMATE_REGION, INTERNATIONAL_CLIMATE_REGION } from "@/app/lib/featured-climate-country";
import {
  GLOBAL_SCHOOLS_SOLAR_PATH,
  PARTNER_REGISTER_PATH,
  FAN_REGISTER_PATH,
} from "@/app/lib/routes";

export default function GlobalSchoolsSolarPage() {
  const project = FEATURED_GLOBAL_SCHOOLS_SOLAR;

  return (
    <SolutionPage
      kicker="Solutions"
      title="Global Schools Solar"
      intro={`${project.description} It is included automatically in every Match Day five and is classified as ${UK_CLIMATE_REGION} and ${INTERNATIONAL_CLIMATE_REGION}.`}
      currentPath={GLOBAL_SCHOOLS_SOLAR_PATH}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
            Featured on every Match Day
          </p>
          <h2 className="mt-4 text-2xl font-black">Always in the five</h2>
          <p className="mt-4 text-slate-300">
            Sustainability Directors choose four Climate Partner projects. Global
            Schools Solar is locked in as the fifth, so every club&apos;s fans can
            vote for school rooftop solar.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
            {UK_CLIMATE_REGION} and {INTERNATIONAL_CLIMATE_REGION}
          </p>
          <h2 className="mt-4 text-2xl font-black">One programme, two labels</h2>
          <p className="mt-4 text-slate-300">
            GSS is not a local-country project. It sits as {UK_CLIMATE_REGION}{" "}
            and {INTERNATIONAL_CLIMATE_REGION} so English, Scottish, Spanish and
            Italian clubs all present the same featured school-solar programme.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
            Impact
          </p>
          <h2 className="mt-4 text-2xl font-black">
            {project.estimated_co2.toLocaleString("en-GB")} tCO₂e
          </h2>
          <p className="mt-4 text-slate-300">
            Target funding {project.funding_goal.toLocaleString("en-GB", {
              style: "currency",
              currency: "GBP",
              maximumFractionDigits: 0,
            })}{" "}
            to put clean power on school roofs worldwide.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
          Signature school
        </p>
        <h2 className="mt-3 text-3xl font-black">Tynecastle High School</h2>
        <p className="mt-2 text-slate-400">Edinburgh, Scotland</p>
        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          Hearts supporters have already shown how Match Day votes send Climate
          Credits to rooftop solar at a local school. The same GSS card appears
          for every other club, alongside List 1 (local) and List 2
          ({INTERNATIONAL_CLIMATE_REGION}) Climate Partner projects.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            ["Students", "1,250"],
            ["Teachers", "105"],
            ["Solar capacity", "120 kW"],
            ["CO₂ saved", "58 t"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-950 p-5">
              <p className="text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={FAN_REGISTER_PATH}
            className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
          >
            Vote as a Fan
          </Link>
          <Link
            href={PARTNER_REGISTER_PATH}
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold"
          >
            Register as a Climate Partner
          </Link>
        </div>
      </div>
    </SolutionPage>
  );
}
