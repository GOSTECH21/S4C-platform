"use client";

import { useState } from "react";
import Image from "next/image";
import { hardNavigateOnClick } from "@/app/lib/hard-navigate";
import {
  HOME_CLUB_CTA,
  HOME_CLUB_HEADING,
  HOME_CLUB_IMAGE,
  HOME_CLUB_KICKER,
  HOME_CLUB_POINTS,
  HOME_CLUB_STAMP,
  HOME_CLUB_SUPPORT,
} from "@/app/lib/home-hero";
import {
  EXPLORE_MATCHRAV_LABEL,
  FAN_FUNDING_HEADING,
  FAN_FUNDING_LEAD,
  FAN_FUNDING_PARAS,
  FAN_JOIN_HEADING,
  FAN_JOIN_KICKER,
  FAN_PRODUCT_TABS,
  FAN_WAYS_HEADING,
  JOIN_S4P_FREE_LABEL,
  MATCHRAV_EXPLORE_HREF,
  MATCHRAV_NAME,
  MATCHRAV_STAMP,
  PLAY_P4P_LABEL,
  type FanProductTabId,
} from "@/app/lib/matchrav";
import {
  CLUB_REGISTER_PATH,
  FAN_LOGIN_PATH,
  FAN_REGISTER_PATH,
} from "@/app/lib/routes";

const MINT = "#0c5c2c";
const MARK_GREEN = "#5bc662";
const TAB_BG = "rgba(12, 92, 44, 0.08)";
const TAB_BG_ACTIVE = "rgba(12, 92, 44, 0.16)";

function FanProductIcon({
  name,
}: {
  name: (typeof FAN_PRODUCT_TABS)[number]["icon"];
}) {
  const common = "h-5 w-5 shrink-0 sm:h-6 sm:w-6";
  if (name === "route") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke={MINT}
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 13.5a4.5 4.5 0 0 0 6.36 0l1.77-1.77a4.5 4.5 0 1 0-6.36-6.36L10 6.64"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.5 10.5a4.5 4.5 0 0 0-6.36 0L6.37 12.27a4.5 4.5 0 1 0 6.36 6.36L14 17.36"
        />
      </svg>
    );
  }
  if (name === "target") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke={MINT}
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="12" cy="12" r="1.4" fill={MINT} stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill={MINT} aria-hidden>
      <path d="M12 3.4A8.6 8.6 0 1 0 20.6 12 8.6 8.6 0 0 0 12 3.4Zm0 1.7c1.4 0 2.6.9 3.6 2.3L12 9.1 8.4 7.4C9.4 6 10.6 5.1 12 5.1Zm-6.4 3.3 2.8 1.3v4.6l-2.8 1.3A7 7 0 0 1 5.6 8.4Zm2.2 8.4L12 15.2l4.2 1.6A7 7 0 0 1 7.8 16.8Zm8.4-2.2V9.7l2.8-1.3a7 7 0 0 1 0 7.5l-2.8-1.3Z" />
    </svg>
  );
}

const outlineCtaClass =
  "flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full border-2 bg-transparent px-3 py-3 text-[0.68rem] font-black uppercase tracking-[0.06em] hover:bg-emerald-50 sm:px-4 sm:py-3.5 sm:text-sm sm:tracking-[0.12em]";

export function FanJoinPanel({ compact = false }: { compact?: boolean }) {
  const [selectedTab, setSelectedTab] = useState<FanProductTabId>("matchrav");

  return (
        <article
          id="matchrav"
          aria-labelledby="fan-join-heading"
          data-fan-join-copy={MATCHRAV_STAMP}
          data-home-block="home-block-3"
          data-play-p4p-fan-login="play-p4p-fan-login-v1"
          className={`s4p-navy-panel rounded-[1.75rem] border border-emerald-400/30 shadow-sm ${
            compact
              ? "px-4 py-6"
              : "px-6 py-8 sm:px-10 sm:py-9"
          }`}
        >
          <p
            className="text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: MINT }}
          >
            {FAN_JOIN_KICKER}
          </p>
          <h2
            id="fan-join-heading"
            className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl"
          >
            {FAN_JOIN_HEADING}
          </h2>
          <p
            data-fan-ways-heading="three-ways-v1"
            className="mt-6 text-center text-lg font-black uppercase tracking-tight sm:text-xl"
          >
            {FAN_WAYS_HEADING}
          </p>
          <div
            role="tablist"
            aria-label={`${MATCHRAV_NAME}, P4P and S4P`}
            data-fan-join-tabs={MATCHRAV_STAMP}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            {FAN_PRODUCT_TABS.map((tab) => {
              const selected = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  data-fan-join-tab={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className="flex min-h-[6.4rem] flex-col items-start rounded-2xl px-2.5 py-3 text-left sm:min-h-[7rem] sm:px-4 sm:py-4"
                  style={{
                    background: selected ? TAB_BG_ACTIVE : TAB_BG,
                    color: MINT,
                  }}
                >
                  <FanProductIcon name={tab.icon} />
                  <span className="mt-2 text-[0.82rem] font-black leading-tight sm:text-lg">
                    {tab.label}
                  </span>
                  <span className="mt-1 text-[0.65rem] font-semibold leading-snug text-emerald-950/70 sm:text-sm">
                    {tab.detail}
                  </span>
                </button>
              );
            })}
          </div>
          <a
            href={FAN_REGISTER_PATH}
            data-fan-join-cta="join-s4p-free"
            onClick={(event) => hardNavigateOnClick(FAN_REGISTER_PATH, event)}
            className="mt-4 flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-s4p-mark px-3 py-3.5 text-[0.72rem] font-black uppercase tracking-[0.08em] text-black hover:brightness-110 sm:px-4 sm:text-base sm:tracking-[0.16em]"
          >
            {JOIN_S4P_FREE_LABEL}
          </a>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={MATCHRAV_EXPLORE_HREF}
              data-fan-join-cta="explore-matchrav"
              onClick={(event) =>
                hardNavigateOnClick(MATCHRAV_EXPLORE_HREF, event)
              }
              className={outlineCtaClass}
              style={{ borderColor: MINT, color: MINT }}
            >
              {EXPLORE_MATCHRAV_LABEL}
            </a>
            <a
              href={FAN_LOGIN_PATH}
              data-fan-join-tab="play-p4p"
              onClick={(event) => hardNavigateOnClick(FAN_LOGIN_PATH, event)}
              className={outlineCtaClass}
              style={{ borderColor: MINT, color: MINT }}
            >
              {PLAY_P4P_LABEL}
            </a>
          </div>
          <h3
            data-fan-funding-heading="funding-goes-v1"
            className="mt-8 text-center text-lg font-black uppercase leading-tight tracking-tight sm:text-xl"
          >
            {FAN_FUNDING_HEADING}
          </h3>
          <p
            data-fan-funding-lead="funding-lead-v1"
            className="mt-4 text-sm font-bold leading-6 sm:text-base sm:leading-7"
          >
            {FAN_FUNDING_LEAD}
          </p>
          <div
            data-fan-funding-copy="funding-paras-v1"
            className="mt-3 space-y-3 text-sm font-medium leading-6 sm:text-base sm:leading-7"
          >
            {FAN_FUNDING_PARAS.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </article>
  );
}

export default function HomeJoinMission() {
  return (
    <section
      id="join-s4p-community"
      data-matchrav-below-club="matchrav-below-club-v1"
      className="scroll-mt-24 px-4 pb-2 pt-4 md:px-8"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <article
          aria-labelledby="club-director-heading"
          data-club-director-copy={HOME_CLUB_STAMP}
          data-home-block="home-block-2"
          className="s4p-navy-panel overflow-hidden rounded-[1.75rem] border border-emerald-400/30 px-4 py-5 shadow-sm sm:px-8 sm:py-8"
        >
          <Image
            src={HOME_CLUB_IMAGE}
            alt="A packed stadium under floodlights at night"
            width={1600}
            height={900}
            className="h-auto w-full rounded-[1.25rem] object-cover"
            unoptimized
            priority
          />
          <p
            className="mt-5 text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: MINT }}
          >
            {HOME_CLUB_KICKER}
          </p>
          <h2
            id="club-director-heading"
            className="mt-3 text-[1.45rem] font-black uppercase leading-snug tracking-tight sm:text-4xl"
          >
            {HOME_CLUB_HEADING}
          </h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
            {HOME_CLUB_SUPPORT}
          </p>
          <ul className="mt-5 space-y-3">
            {HOME_CLUB_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: MARK_GREEN, color: MARK_GREEN }}
                  aria-hidden
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M3.2 8.4 6.1 11.2 12.8 4.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm font-semibold leading-6 sm:text-base">
                  {point}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={CLUB_REGISTER_PATH}
            onClick={(event) => hardNavigateOnClick(CLUB_REGISTER_PATH, event)}
            data-club-cta="club-cta-one-line-v1"
            className="mt-8 flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-s4p-mark px-3 py-3.5 text-[0.72rem] font-black uppercase tracking-[0.06em] text-black hover:brightness-110 sm:px-6 sm:py-4 sm:text-base sm:tracking-[0.18em]"
          >
            {HOME_CLUB_CTA} <span aria-hidden> →</span>
          </a>
        </article>

        <FanJoinPanel />
      </div>
    </section>
  );
}
