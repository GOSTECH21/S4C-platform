"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  CLUB_ADDRESS_BOOK_EVENT,
  loadClubAddressBooks,
  deleteClubAddressBookContact,
} from "@/app/lib/club-address-book";
import {
  CLUB_PARTNERS_BOARD_NAME,
  CLUB_PARTNERS_BOARD_NOTE,
  CLUB_PARTNERS_BOARD_SETTINGS,
  CLUB_PARTNERS_BOARD_STAMP,
  CLUB_PARTNERS_BOARD_EVENT,
  CLUB_PARTNERS_TABS,
  clubPartnersCounts,
  clubPartnersRemovePrompt,
  clubPartnersRows,
  clubPartnersSeasonLabel,
  notifyClubPartnersBoard,
  removeClubChosenPartner,
  type ClubPartnersPartnerInput,
  type ClubPartnersRow,
  type ClubPartnersSignedInput,
  type ClubPartnersTabId,
} from "@/app/lib/club-partners-board";
import {
  deleteClubClimateSponsor,
  loadClubSponsorRoster,
} from "@/app/services/climate-sponsors.service";
import {
  removeLocalSponsorForClub,
  submittedLocalSponsorsForClub,
} from "@/app/lib/local-sponsor";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function ClubPartnersBoard({
  clubId,
  clubName,
  partners = [],
  signed = [],
}: {
  clubId: string;
  clubName: string;
  partners?: ClubPartnersPartnerInput[];
  signed?: ClubPartnersSignedInput[];
}) {
  const [tab, setTab] = useState<ClubPartnersTabId>("lead");
  const [showSettings, setShowSettings] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function refresh() {
      setTick((current) => current + 1);
    }
    window.addEventListener(CLUB_PARTNERS_BOARD_EVENT, refresh);
    window.addEventListener(CLUB_ADDRESS_BOOK_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CLUB_PARTNERS_BOARD_EVENT, refresh);
      window.removeEventListener(CLUB_ADDRESS_BOOK_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const rows = useMemo(() => {
    const books = loadClubAddressBooks(clubId);
    const roster = loadClubSponsorRoster(clubId, clubName);
    return clubPartnersRows({
      leadContacts: books.lead,
      localContacts: books.local,
      rosterSponsors: roster.sponsors,
      localRecords: submittedLocalSponsorsForClub(clubName),
      signed,
      partners,
    });
  }, [clubId, clubName, partners, signed, tick]);

  const counts = clubPartnersCounts(rows);
  const visible = rows[tab];

  function exportReport() {
    const blob = new Blob([JSON.stringify({ clubName, counts, rows }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `club-climate-partners-${clubName.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function removeRow(row: ClubPartnersRow) {
    const ok = window.confirm(
      clubPartnersRemovePrompt(row.name, clubName, row.tab)
    );
    if (!ok) return;
    if (row.tab === "partners") {
      removeClubChosenPartner(clubId, row.id);
    } else {
      if (row.addressBookId) {
        deleteClubAddressBookContact(
          clubId,
          row.tab === "lead" ? "lead" : "local",
          row.addressBookId
        );
      }
      if (row.rosterId) {
        deleteClubClimateSponsor(clubId, clubName, row.rosterId);
      } else {
        const roster = loadClubSponsorRoster(clubId, clubName);
        const match = roster.sponsors.find(
          (sponsor) =>
            sponsor.brandName.trim().toLowerCase() ===
            row.name.trim().toLowerCase()
        );
        if (match) deleteClubClimateSponsor(clubId, clubName, match.id);
      }
      if (row.tab === "local") {
        removeLocalSponsorForClub(clubName, row.name);
      }
      notifyClubPartnersBoard();
    }
  }

  return (
    <section
      data-club-partners-board={CLUB_PARTNERS_BOARD_STAMP}
      className="mt-12 min-w-0 max-w-full overflow-x-hidden rounded-3xl border p-3 sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-s4p-mark/20 text-lg">
            🤝
          </span>
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {CLUB_PARTNERS_BOARD_NAME}
            </h2>
            <p className="mt-1 inline-flex rounded-full border border-s4p-mark bg-s4p-mark/15 px-3 py-1 text-xs font-semibold">
              {clubPartnersSeasonLabel(clubName)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportReport}
            className="fp-tab-off rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Export Report
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((open) => !open)}
            className="fp-settings rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Settings
          </button>
        </div>
      </div>
      <p className="fp-muted mt-4 max-w-3xl text-sm">{CLUB_PARTNERS_BOARD_NOTE}</p>
      {showSettings ? (
        <p className="fp-card mt-3 rounded-2xl border p-4 text-sm">
          {CLUB_PARTNERS_BOARD_SETTINGS}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Lead Climate Sponsors" value={String(counts.lead)} hint="on this Club" />
        <Kpi label="Local Business" value={String(counts.local)} hint="Climate Sponsors" />
        <Kpi
          label="Climate Project Partners"
          value={String(counts.partners)}
          hint="chosen for Match Day"
        />
        <Kpi label="On this Club" value={String(counts.total)} hint="names you can manage" />
      </div>

      <div className="fp-tab mt-6 flex flex-wrap gap-2">
        {CLUB_PARTNERS_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${
              tab === item.id ? "fp-tab-on" : "fp-tab-off"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="fp-card mt-6 rounded-2xl border p-5 text-sm">
          {emptyCopy(tab)}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((row) => (
            <li
              key={row.id}
              className="fp-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <BrandMark
                  name={row.name}
                  logoUrl={sponsorLogoSrc(row.name, null)}
                  className="h-12 w-12 shrink-0 text-sm"
                />
                <div className="min-w-0">
                  <p className="text-lg font-black">{row.name}</p>
                  {row.contact ? (
                    <p className="mt-1 text-sm font-semibold">{row.contact}</p>
                  ) : null}
                  {row.email ? (
                    <p className="fp-muted mt-1 text-sm">{row.email}</p>
                  ) : null}
                  <p className="fp-muted mt-1 text-xs font-semibold">{row.hint}</p>
                </div>
              </div>
              {row.removable ? (
                <button
                  type="button"
                  onClick={() => removeRow(row)}
                  className="fp-tab-off shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold"
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function emptyCopy(tab: ClubPartnersTabId): string {
  if (tab === "lead") {
    return "No Lead Climate Sponsors on this Club yet. Add them in Address Book 1 on Sponsors.";
  }
  if (tab === "local") {
    return "No Local Business Climate Sponsors on this Club yet. Add them in Address Book 2 on Sponsors.";
  }
  return "No chosen Climate Project Partners yet. Choose the Match Day five in How it works.";
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="fp-card rounded-2xl border p-4">
      <p className="fp-muted text-[11px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      <p className="fp-muted mt-1 text-xs">{hint}</p>
    </div>
  );
}
