"use client";
/* philanthropist-register-v1 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  PHILANTHROPIST_REGISTER_PATH,
  PHILANTHROPIST_SPONSOR_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_NEW_SPONSORSHIP_LABEL,
} from "@/app/lib/routes";
import { PhilanthropistAdmin } from "@/app/components/sponsor/PhilanthropistAdmin";
import { PhilanthropistMatchGift } from "@/app/components/sponsor/PhilanthropistMatchGift";
import { PhilanthropistSponsorsTable } from "@/app/components/sponsor/PhilanthropistSponsorsTable";
import {
  PHILANTHROPIST_HOME_EMPTY,
  PHILANTHROPIST_HOME_HEADING,
  PHILANTHROPIST_KICKER,
  hydratePhilanthropistRecord,
  isPhilanthropistSponsor,
  philanthropistDisplayName,
  philanthropistGiftCopy,
  readPhilanthropistRecord,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";

export default function PhilanthropistHomePage() {
  const [record, setRecord] = useState<PhilanthropistRecord | null>(null);
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setRecord(readPhilanthropistRecord());
    void getCurrentSponsor()
      .then((sponsor) => {
        const brandName = String(sponsor.name ?? "").trim();
        const jobTitle = String(sponsor.industry ?? "");
        setBrand(brandName);
        setEmail(String(sponsor.email ?? "").trim());
        const philanthropist = isPhilanthropistSponsor(brandName, { jobTitle });
        setSignedIn(philanthropist);
        if (philanthropist) {
          setRecord(
            hydratePhilanthropistRecord({
              ...sponsor,
              email: String(sponsor.email ?? "").trim(),
            })
          );
        }
      })
      .catch(() => {
        setBrand("");
        setSignedIn(false);
        setRecord(readPhilanthropistRecord());
      });
  }, []);

  const headingName = record ? philanthropistDisplayName(record) : brand;
  const canSponsor = Boolean(record || signedIn);
  const identity = {
    name: record?.name || headingName || brand,
    organisation: record?.organisation || brand,
    email: record?.email || email,
    createdAt: record?.createdAt,
  };

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
        {record ? philanthropistGiftCopy(record) : PHILANTHROPIST_HOME_EMPTY}
      </p>
      {canSponsor ? (
        <>
          <p className="mt-6">
            <a
              href={PHILANTHROPIST_SPONSOR_PATH}
              className="inline-flex rounded-lg bg-s4p-mark px-5 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
            >
              {SPONSOR_NEW_SPONSORSHIP_LABEL}
            </a>
          </p>
          <PhilanthropistMatchGift
            identity={identity}
            record={record}
            brandName={headingName || brand}
            onSaved={setRecord}
          />
          {record ? (
            <>
              <PhilanthropistAdmin record={record} />
              <PhilanthropistSponsorsTable record={record} />
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
