"use client";

import { useId, useState } from "react";
import {
  CLUB_DETAILS_ACCORDION_STAMP,
  CLUB_REGISTRATION_STATUS_LABEL,
  CLUB_REPRESENTATIVE_ACCORDION_STAMP,
  clubRegistrationStatusCaption,
  clubRegistrationStatusLabel,
} from "@/app/lib/club-registration";
import type {
  ClubAccount,
  ClubProfile,
} from "@/app/services/club-match-day.service";

export default function ClubAdminClubDetails({
  club,
  account,
}: {
  club: ClubProfile;
  account: ClubAccount;
}) {
  const status = clubRegistrationStatusLabel(account.status);
  const representativeName = [account.first_name, account.last_name]
    .filter(Boolean)
    .join(" ");
  const representativeSummary = [representativeName || "Name not set", account.job_title]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Admin
        </p>
        <h1 className="mt-2 text-4xl font-black">{club.name}</h1>
        <p className="mt-2 text-slate-400">
          Welcome to your Score-4-Our-Planet Club Dashboard
        </p>
      </div>

      <div className="space-y-4">
        <AdminAccordion
          stamp={CLUB_DETAILS_ACCORDION_STAMP}
          title="Club details"
          summary={`${status} · ${club.country || "Country not set"}`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField title={CLUB_REGISTRATION_STATUS_LABEL} value={status}>
              <p className="mt-2 text-sm text-slate-400">
                {clubRegistrationStatusCaption()}
              </p>
            </AdminField>
            <AdminField title="Supporters" value={account.supporter_base} />
            <AdminField title="Attendance" value={account.average_attendance} />
            <AdminField title="Country" value={club.country} />
          </div>
        </AdminAccordion>

        <AdminAccordion
          stamp={CLUB_REPRESENTATIVE_ACCORDION_STAMP}
          title="Club Representative"
          summary={representativeSummary}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Name">{representativeName || "—"}</Info>
            <Info label="Role">{account.job_title || "—"}</Info>
            <Info label="Email">{account.email || "—"}</Info>
            <Info label="Phone">{account.phone || "—"}</Info>
          </div>
        </AdminAccordion>
      </div>
    </>
  );
}

function AdminAccordion({
  stamp,
  title,
  summary,
  children,
}: {
  stamp: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <article
      data-club-admin-accordion={stamp}
      className="overflow-hidden rounded-2xl bg-slate-900"
    >
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-start gap-3 p-6 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold text-white">{title}</span>
            <span className="mt-1 block text-sm font-semibold text-slate-400">
              {summary}
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {open ? "Hide" : "Details"}
          </span>
        </button>
      </h2>
      {open ? (
        <div id={detailsId} className="px-6 pb-6">
          {children}
        </div>
      ) : null}
    </article>
  );
}

function AdminField({
  title,
  value,
  children,
}: {
  title: string;
  value: string | number | null | undefined;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-green-400">{value ?? "—"}</p>
      {children}
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-lg">{children}</p>
    </div>
  );
}
