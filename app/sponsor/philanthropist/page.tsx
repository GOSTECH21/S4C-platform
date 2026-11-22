"use client";
/* philanthropist-register-v1 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  PHILANTHROPIST_ADMIN_ID,
  PHILANTHROPIST_PST_ID,
  PHILANTHROPIST_REGISTER_PATH,
  PHILANTHROPIST_SPONSOR_ID,
  SPONSOR_LOGIN_PATH,
  SPONSOR_NEW_SPONSORSHIP_LABEL,
} from "@/app/lib/routes";
import { PhilanthropistAdmin } from "@/app/components/sponsor/PhilanthropistAdmin";
import { PhilanthropistMatchGift } from "@/app/components/sponsor/PhilanthropistMatchGift";
import { PhilanthropistPaymentDue } from "@/app/components/sponsor/PhilanthropistPaymentDue";
import { PhilanthropistSponsorsTable } from "@/app/components/sponsor/PhilanthropistSponsorsTable";
import {
  PHILANTHROPIST_HOME_EMPTY,
  PHILANTHROPIST_HOME_HEADING,
  PHILANTHROPIST_HOME_READY,
  PHILANTHROPIST_KICKER,
  PHILANTHROPIST_MIN_GBP,
  PHILANTHROPIST_STORAGE,
  hydratePhilanthropistRecord,
  isPhilanthropistSponsor,
  philanthropistDisplayName,
  philanthropistFundingGbp,
  philanthropistGiftCopy,
  readPhilanthropistRecord,
  withoutBorrowedLocalGifts,
  writePhilanthropistRecord,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import { fetchLocalSponsorRecords } from "@/app/services/local-sponsor.service";
import {
  allLocalSponsors,
  readLocalSponsorRecord,
} from "@/app/lib/local-sponsor";

export default function PhilanthropistHomePage() {
  const [record, setRecord] = useState<PhilanthropistRecord | null>(() => {
    const stored = readPhilanthropistRecord();
    if (!stored) return null;
    const storedLocal = readLocalSponsorRecord();
    return withoutBorrowedLocalGifts(stored, [
      ...allLocalSponsors(),
      ...(storedLocal ? [storedLocal] : []),
    ]);
  });
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [draftKey, setDraftKey] = useState(0);

  useEffect(() => {
    void getCurrentSponsor()
      .then(async (sponsor) => {
        const brandName = String(sponsor.name ?? "").trim();
        const jobTitle = String(sponsor.industry ?? "");
        setBrand(brandName);
        setEmail(String(sponsor.email ?? "").trim());
        const philanthropist = isPhilanthropistSponsor(brandName, { jobTitle });
        setSignedIn(philanthropist);
        if (philanthropist) {
          const hydrated = hydratePhilanthropistRecord({
            ...sponsor,
            email: String(sponsor.email ?? "").trim(),
          });
          const remote = await fetchLocalSponsorRecords().catch(() => []);
          const cleaned = hydrated
            ? withoutBorrowedLocalGifts(hydrated, remote)
            : null;
          if (cleaned) writePhilanthropistRecord(cleaned);
          else if (hydrated && typeof window !== "undefined") {
            window.localStorage.removeItem(PHILANTHROPIST_STORAGE);
          }
          setRecord(cleaned);
        }
      })
      .catch(() => {
        setBrand("");
        setSignedIn(false);
        setRecord(readPhilanthropistRecord());
      });
  }, []);

  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (id !== PHILANTHROPIST_ADMIN_ID && id !== PHILANTHROPIST_PST_ID) return;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [signedIn, record]);

  const headingName = record ? philanthropistDisplayName(record) : brand;
  const canSponsor = Boolean(record || signedIn);
  const identity = {
    name: record?.name || headingName || brand,
    organisation: record?.organisation || brand,
    email: record?.email || email,
    createdAt: record?.createdAt,
  };
  const adminRecord: PhilanthropistRecord | null =
    record ??
    (canSponsor
      ? {
          name: identity.name || headingName || "Philanthropist",
          organisation: identity.organisation || headingName || "",
          email: identity.email,
          clubName: "",
          giftGbp: 0,
          createdAt: identity.createdAt || new Date().toISOString(),
          matchSponsorships: [],
        }
      : null);

  return (
    <div
      className="mx-auto max-w-5xl py-10"
      data-philanthropist-home="philanthropist-register-v1"
      data-testid="philanthropist-home"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        {PHILANTHROPIST_KICKER}
      </p>
      <h1 className="mt-3 text-4xl font-black">{PHILANTHROPIST_HOME_HEADING}</h1>
      {headingName ? (
        <p className="mt-2 text-lg font-semibold text-white">{headingName}</p>
      ) : null}
      <p className="mt-4 text-slate-300">
        {record && philanthropistFundingGbp(record) >= PHILANTHROPIST_MIN_GBP
          ? philanthropistGiftCopy(record)
          : canSponsor
            ? PHILANTHROPIST_HOME_READY
            : PHILANTHROPIST_HOME_EMPTY}
      </p>
      {record && philanthropistFundingGbp(record) >= PHILANTHROPIST_MIN_GBP ? (
        <PhilanthropistPaymentDue record={record} />
      ) : null}
      {canSponsor ? (
        <>
          <p className="mt-6">
            <button
              type="button"
              data-philanthropist-new-sponsorship="philanthropist-new-match-v1"
              onClick={() => {
                setDraftKey((current) => current + 1);
                window.requestAnimationFrame(() => {
                  document
                    .getElementById(PHILANTHROPIST_SPONSOR_ID)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              className="inline-flex rounded-lg bg-s4p-mark px-5 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
            >
              {SPONSOR_NEW_SPONSORSHIP_LABEL}
            </button>
          </p>
          <PhilanthropistMatchGift
            key={draftKey}
            identity={identity}
            record={record}
            brandName={headingName || brand}
            onSaved={setRecord}
          />
          {adminRecord ? (
            <>
              <PhilanthropistAdmin record={adminRecord} />
              <PhilanthropistSponsorsTable record={adminRecord} />
            </>
          ) : null}
        </>
      ) : (
        <p className="mt-8 flex flex-wrap gap-3">
          <Link
            href={PHILANTHROPIST_REGISTER_PATH}
            className="inline-flex items-center justify-center rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950 hover:bg-green-400"
          >
            Register as Philanthropist
          </Link>
          <Link
            href={SPONSOR_LOGIN_PATH}
            className="inline-flex items-center justify-center rounded-xl border border-s4p-mark bg-s4p-mark/15 px-5 py-3 font-bold text-slate-950 hover:bg-s4p-mark/30"
          >
            Login
          </Link>
        </p>
      )}
    </div>
  );
}
