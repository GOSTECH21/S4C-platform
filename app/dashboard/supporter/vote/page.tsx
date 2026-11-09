"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FanNav from "../components/FanNav";
import {
  FAN_LOGIN_PATH,
  SUPPORTER_CLIMATE_SPONSORS_HASH,
} from "@/app/lib/routes";
import {
  P4P_FALLBACK_PROJECTS,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";

const FanCampaignWorkspace = dynamic(
  () =>
    import("@/app/components/fan/FanCampaignWorkspace").then(
      (mod) => mod.FanCampaignWorkspace
    ),
  { ssr: false }
);

export default function VotePage() {
  const [donateFunding, setDonateFunding] = useState(false);
  const [donateWallet, setDonateWallet] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDonateFunding(params.get("p4pDonate") === "1");
    const wallet = Number(params.get("wallet") || 0);
    setDonateWallet(Number.isFinite(wallet) ? wallet : 0);
  }, []);

  useEffect(() => {
    async function guard() {
      const { getOrCreateSupporter } = await import(
        "@/app/services/votes.service"
      );
      const supporter = await getOrCreateSupporter();
      if (!supporter) window.location.href = FAN_LOGIN_PATH;
    }
    void guard();
  }, []);

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-xl">
        <FanNav />
        {donateFunding ? (
          <p
            data-p4p-donate-funding="p4p-donate-funding-v1"
            className="mt-4 text-base font-black text-emerald-800"
          >
            Here are Climate Projects to donate your funding
            {donateWallet > 0
              ? ` · P4P Wallet ${formatP4pGbp(donateWallet)}`
              : ""}
          </p>
        ) : null}
        {donateFunding ? (
          <ol
            data-p4p-donate-project-list="p4p-donate-project-list-v1"
            className="mt-6 space-y-3"
          >
            {P4P_FALLBACK_PROJECTS.map((name, index) => (
              <li
                key={name}
                className="rounded-2xl border border-emerald-200 bg-white p-5"
              >
                <p className="text-lg font-black text-emerald-800">
                  {index + 1}. {name}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <section
            id={SUPPORTER_CLIMATE_SPONSORS_HASH}
            className="mt-4 scroll-mt-28"
          >
            <FanCampaignWorkspace section="cards" />
          </section>
        )}
      </div>
    </main>
  );
}
