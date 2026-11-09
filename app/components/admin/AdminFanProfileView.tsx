"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ADMIN_FAN_PROFILE_STAMP,
  formatFanDonationGbp,
  formatFanMatchravKg,
  type StaffFanProfile,
} from "@/app/lib/admin-fan-profile";
import { ADMIN_PATH } from "@/app/lib/routes";

export function AdminFanProfileView({
  profile,
  backHref = ADMIN_PATH,
}: {
  profile: StaffFanProfile;
  backHref?: string;
}) {
  const clubs =
    profile.clubs.length > 0
      ? profile.clubs.join(", ")
      : profile.fan.clubName;

  return (
    <div
      data-admin-fan-profile={ADMIN_FAN_PROFILE_STAMP}
      className="space-y-6"
    >
      <div>
        <Link
          href={backHref}
          className="text-sm font-semibold text-green-400 hover:underline"
        >
          Back to registered fans
        </Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Fan/Supporter profile
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          {profile.fan.fullName}
        </h1>
        <p className="mt-2 break-all text-slate-300">{profile.fan.email}</p>
        <p className="mt-1 text-sm text-green-300">{clubs}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total donations"
          value={formatFanDonationGbp(profile.totalDonationsGbp)}
        />
        <Stat
          label="Climate Projects"
          value={String(profile.projects.length)}
        />
        <Stat
          label="P4P predictions"
          value={String(profile.predictions.length)}
        />
      </section>

      <ProfileCard
        title="Climate Projects allotted funds"
        empty="No Climate Project funds recorded for this fan yet."
      >
        {profile.projects.map((row, index) => (
          <li
            key={`${row.projectName}-${index}`}
            className="border-b border-slate-800 py-3 last:border-b-0"
          >
            <p className="font-semibold">{row.projectName}</p>
            <p className="mt-1 text-sm text-slate-400">
              {row.clubName ? `${row.clubName} · ` : ""}
              {row.amountGbp != null
                ? formatFanDonationGbp(row.amountGbp)
                : "Voted"}
              {row.source === "p4p"
                ? " · P4P"
                : row.source === "wallet"
                  ? " · Carbon Wallet"
                  : ""}
            </p>
          </li>
        ))}
      </ProfileCard>

      <ProfileCard
        title="Donations"
        empty="No donations recorded for this fan yet."
      >
        {profile.donations.map((row, index) => (
          <li
            key={`${row.projectName}-${row.at}-${index}`}
            className="border-b border-slate-800 py-3 last:border-b-0"
          >
            <p className="font-semibold">
              {formatFanDonationGbp(row.amountGbp)} to {row.projectName}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {[row.clubName, row.brandName].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ProfileCard>

      <ProfileCard
        title="P4P predictions"
        empty="No Predict-For Planet predictions recorded for this fan yet."
      >
        {profile.predictions.map((row) => (
          <li
            key={row.id}
            className="border-b border-slate-800 py-3 last:border-b-0"
          >
            <p className="font-semibold">{row.fixtureName}</p>
            <p className="mt-1 text-sm text-slate-300">
              {row.categoryLabels.join(", ") || "P4P events"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {row.clubName ? `${row.clubName} · ` : ""}
              {row.projectName}
              {row.engagementGbp
                ? ` · ${formatFanDonationGbp(row.engagementGbp)}`
                : ""}
              {row.correct === true
                ? " · Accurate"
                : row.correct === false
                  ? " · Missed"
                  : ""}
            </p>
          </li>
        ))}
      </ProfileCard>

      <ProfileCard
        title="Matchrav"
        empty="No Matchrav journeys recorded for this fan yet."
      >
        {profile.matchrav.map((row) => (
          <li
            key={row.id}
            className="border-b border-slate-800 py-3 last:border-b-0"
          >
            <p className="font-semibold">{row.fixtureName}</p>
            <p className="mt-1 text-sm text-slate-300">
              {row.outboundMode}
              {row.returnMode && row.returnMode !== row.outboundMode
                ? ` / ${row.returnMode}`
                : ""}{" "}
              · {formatFanMatchravKg(row.totalKg)} kg CO₂e
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {[row.clubName, row.origin, row.status].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ProfileCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white sm:text-3xl">{value}</p>
    </div>
  );
}

function ProfileCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-8">
      <h2 className="text-2xl font-black">{title}</h2>
      {hasItems ? (
        <ul className="mt-4">{children}</ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}
