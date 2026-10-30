"use client";
/* how-s4p-split-steps-v1 */

import Image from "next/image";
import { PHONE_COLUMN_CLASS } from "@/app/components/home/PhoneFrame";
import { HOW_S4P_ACCESS_JOIN } from "@/app/lib/how-s4p-works";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";
const ACCESS_JOIN_ID = "access-join";

const ACCESS_JOIN_HOTSPOTS: Array<{
  label: string;
  intent: "register" | "login";
  className: string;
}> = [
  {
    label: "Scan QR to join",
    intent: "register",
    className: "left-[20%] top-[36%] h-[32%] w-[60%] rounded-lg",
  },
  {
    label: "Join via website",
    intent: "register",
    className: "left-[11%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via App Store",
    intent: "register",
    className: "left-[30.5%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via Google Play",
    intent: "register",
    className: "left-[50%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via TV or broadcast",
    intent: "register",
    className: "left-[69.5%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Create Account",
    intent: "register",
    className: "left-[12%] top-[84.2%] h-[5.8%] w-[76%] rounded-full",
  },
  {
    label: "Log in",
    intent: "login",
    className: "left-[28%] top-[90.6%] h-[4%] w-[44%] rounded-md",
  },
];

export default function HowItWorks({
  onCreateAccount,
  onLogin,
}: {
  onCreateAccount: () => void;
  onLogin: () => void;
}) {
  return (
    <section id="how-s4p-works" className="overflow-x-hidden pb-8 md:pb-12">
      <div className="border-y border-emerald-400/20">
        <div className="mx-auto max-w-[1600px] px-5 py-5 md:px-10 xl:py-5">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl xl:text-[2.4rem]">
              How S<span style={{ color: MARK_GREEN }}>4</span>P Works
            </h2>
            <p className="mt-2 text-sm font-bold uppercase leading-6 tracking-tight sm:text-base">
              Same passion. Cleaner planet.
            </p>
            <p
              className="mt-1 text-base font-black uppercase leading-6 tracking-tight sm:text-lg"
              style={{ color: MINT }}
            >
              Every score counts. Every fan counts.
            </p>
          </div>
        </div>
      </div>

      <div
        id={ACCESS_JOIN_ID}
        className="mx-auto max-w-[1400px] scroll-mt-24 px-4 pb-4 pt-8 md:px-8"
      >
        <div
          data-how-s4p-access-join
          className="s4p-navy-panel overflow-hidden rounded-[1.75rem] border border-emerald-400/30 px-3 py-6 sm:px-6 sm:py-8 md:px-8"
        >
          <div className="flex min-w-0 flex-col items-center gap-8 px-1 lg:flex-row lg:items-center lg:gap-12">
            <div
              className={`${PHONE_COLUMN_CLASS} hidden md:block`}
              data-phone-column
            >
              <Image
                src={HOW_S4P_ACCESS_JOIN.src}
                alt={HOW_S4P_ACCESS_JOIN.alt}
                width={HOW_S4P_ACCESS_JOIN.width}
                height={HOW_S4P_ACCESS_JOIN.height}
                className="pointer-events-none hidden h-auto w-full md:block"
                unoptimized
                priority
                data-phone-frame
              />
              {ACCESS_JOIN_HOTSPOTS.map((spot) => (
                <button
                  key={spot.label}
                  type="button"
                  aria-label={spot.label}
                  onClick={
                    spot.intent === "login" ? onLogin : onCreateAccount
                  }
                  className={`absolute z-10 cursor-pointer hover:ring-2 hover:ring-[#5bc662] ${spot.className}`}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
                {HOW_S4P_ACCESS_JOIN.title}
              </h3>
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
                {HOW_S4P_ACCESS_JOIN.caption}
              </p>
              <ul className="mt-5 space-y-3">
                {HOW_S4P_ACCESS_JOIN.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-black text-black"
                      style={{ backgroundColor: MARK_GREEN }}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="text-sm font-semibold leading-6 sm:text-base">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="inline-flex items-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110"
                >
                  Create your free account <span aria-hidden> →</span>
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center rounded-full border-2 border-black px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:bg-black hover:text-[#f7f4e8]"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
