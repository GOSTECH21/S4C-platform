"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HOME_STAKEHOLDERS,
  type HomeStakeholder,
} from "@/app/lib/home-stakeholders";
import { hardNavigateOnClick } from "@/app/lib/hard-navigate";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";
const PAPER = "#fffdf8";
const TAB_SELECTED = "#dcefdc";

const FOREST_STATS: Array<{
  label: string;
  detail: string;
  icon: "leaf" | "calendar" | "fans" | "seedling" | "globe";
}> = [
  { label: "5", detail: "Major Sports", icon: "leaf" },
  {
    label: "One",
    detail: "Club. One Match. Two Climate Missions.",
    icon: "calendar",
  },
  { label: "Millions", detail: "of Fans Worldwide", icon: "fans" },
  { label: "Real", detail: "Climate Projects", icon: "seedling" },
  { label: "A Cleaner,", detail: "Greener Future", icon: "globe" },
];

function StatIcon({ name }: { name: (typeof FOREST_STATS)[number]["icon"] }) {
  const common = "h-8 w-8 shrink-0";
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M5 20s8-4 14-16c-9 1-16 8-16 16 5-1 10-3 14-6" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M7 3.2h1.8v1.4h6.4V3.2H17v1.4h2.2A1.8 1.8 0 0 1 21 6.4v12.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.8V6.4a1.8 1.8 0 0 1 1.8-1.8H7V3.2ZM4.8 9.2v9.6h14.4V9.2H4.8Z" />
      </svg>
    );
  }
  if (name === "fans") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M8.2 9.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Zm7.6 0a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM3.6 19c.4-2.8 2.6-4.7 5.1-4.7 1 0 1.9.3 2.7.8-.4.7-.7 1.5-.8 2.4l-.2 1.5H3.6Zm9.2 0 .2-1.6c.2-1.6 1-3 2.2-3.9 1 .5 2.1.8 3.3.8 2.5 0 4.6-1.7 5.1-4.5h-3.8c-.3 1.2-1.3 2.1-2.5 2.4-1 .2-1.9-.1-2.5-.7-.4.7-.6 1.5-.7 2.3L13 19h-.2Z" />
      </svg>
    );
  }
  if (name === "seedling") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 21V11.4C7.4 11.2 3.6 8.2 3.2 3.6 8.8 3.8 12 7.2 12 11.4c0-4.2 3.2-7.6 8.8-7.8C20.4 8.2 16.6 11.2 12 11.4V21Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Zm0 1.7c.5 0 1.6 1.3 2.2 3.6H9.8C10.4 6 11.5 4.7 12 4.7ZM8.2 10h7.6A12.6 12.6 0 0 1 12 17.6 12.6 12.6 0 0 1 8.2 10Z" />
    </svg>
  );
}

function roleCta(
  card: HomeStakeholder,
  joinIntent: "login" | "register",
  mobile: boolean
) {
  const href = joinIntent === "login" ? card.login : card.register;
  const text =
    joinIntent === "login"
      ? card.loginButtonText
      : mobile
        ? card.tabCta
        : card.registerText;
  return { href, text };
}

function RoleCard({
  card,
  joinIntent,
}: {
  card: HomeStakeholder;
  joinIntent: "login" | "register";
}) {
  const { href, text } = roleCta(card, joinIntent, false);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-emerald-400/25 bg-s4p-paper shadow-sm">
      <h3
        className="px-3.5 pt-4 text-sm font-black uppercase tracking-wide sm:px-4 sm:text-base"
        style={{ color: MINT }}
      >
        {card.title}
      </h3>
      <Image
        src={card.image}
        alt={card.imageAlt}
        width={444}
        height={232}
        className="mt-3 h-auto w-full"
        unoptimized
        loading="eager"
      />
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3 sm:px-4">
        <p className="text-[0.72rem] font-black uppercase leading-tight sm:text-sm">
          {card.kicker}
        </p>
        <p className="mt-2 flex-1 text-[0.72rem] leading-5 lg:hidden">
          {card.shortDescription}
        </p>
        <p className="mt-2 hidden flex-1 text-sm leading-6 lg:block">
          {card.description}
        </p>
        <a
          href={href}
          onClick={(event) => hardNavigateOnClick(href, event)}
          className="mt-3 block rounded-full px-2 py-2.5 text-center text-[0.68rem] font-bold leading-snug hover:brightness-110 sm:text-xs"
          style={{ backgroundColor: MINT, color: PAPER }}
        >
          {text}
        </a>
      </div>
    </article>
  );
}

export default function HomeRoleSection({
  joinIntent,
  onJoin,
}: {
  joinIntent: "login" | "register";
  onJoin: (intent: "login" | "register") => void;
}) {
  const [selectedTitle, setSelectedTitle] = useState(
    HOME_STAKEHOLDERS[0].title
  );
  const selected =
    HOME_STAKEHOLDERS.find((card) => card.title === selectedTitle) ??
    HOME_STAKEHOLDERS[0];
  const selectedCta = roleCta(selected, joinIntent, true);
  const panelId = "role-tab-panel";

  return (
    <section id="are-you" className="scroll-mt-24 overflow-x-hidden pb-16">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div
          data-role-cards-panel
          className="overflow-hidden rounded-[1.75rem] border border-emerald-400/25 bg-s4p-paper px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-8"
        >
          <div className="hidden text-center md:block">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-s4p-mint">
              Join the S4P community
            </p>
            <h2
              className="mt-2 text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl"
              style={{ color: MINT }}
            >
              Different roles. One mission. A cleaner, greener sport.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 sm:text-base">
              Find your role below and discover how you can make a difference.
            </p>
          </div>

          <div
            data-role-tabs-mobile="role-tabs-mobile-v1"
            className="md:hidden"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-s4p-mint">
              Join the S4P community
            </p>
            <h2 className="mt-2 text-[1.65rem] font-black leading-tight tracking-tight text-slate-950">
              Different roles. One mission.
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Who are you joining as?
            </p>
            <div
              role="tablist"
              aria-label="Who are you joining as?"
              className="mt-4 grid grid-cols-2 gap-2"
            >
              {HOME_STAKEHOLDERS.map((card) => {
                const isSelected = card.title === selected.title;
                return (
                  <button
                    key={card.title}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={panelId}
                    data-role-tab={card.title}
                    onClick={() => setSelectedTitle(card.title)}
                    className={`w-full rounded-2xl border px-3 py-3.5 text-center text-[0.84rem] font-semibold leading-snug ${
                      isSelected
                        ? "border-emerald-400/50"
                        : "border-black/10 bg-s4p-paper text-slate-950"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: TAB_SELECTED, color: MINT }
                        : undefined
                    }
                  >
                    {card.title}
                  </button>
                );
              })}
            </div>
            <div
              id={panelId}
              role="tabpanel"
              data-role-tab-panel={selected.title}
              className="mt-6"
            >
              <p
                className="text-xs font-black uppercase tracking-[0.18em]"
                style={{ color: MINT }}
              >
                {selected.title}
              </p>
              <Image
                src={selected.image}
                alt={selected.imageAlt}
                width={444}
                height={232}
                className="mt-3 h-auto w-full rounded-2xl"
                unoptimized
                loading="eager"
              />
              <h3 className="mt-4 text-xl font-black leading-tight tracking-tight text-slate-950">
                {selected.tabHeading}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                {selected.tabDescription}
              </p>
              <a
                href={selectedCta.href}
                onClick={(event) =>
                  hardNavigateOnClick(selectedCta.href, event)
                }
                className="mt-5 flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-3.5 text-sm font-bold hover:brightness-110"
                style={{ backgroundColor: MINT, color: PAPER }}
              >
                {selectedCta.text}
              </a>
            </div>
          </div>

          <div
            data-role-cards-grid
            className="mt-8 hidden md:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            {HOME_STAKEHOLDERS.map((card) => (
              <RoleCard
                key={card.title}
                card={card}
                joinIntent={joinIntent}
              />
            ))}
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[1.5rem]">
          <Image
            src="/images/home/roles-forest.png"
            alt=""
            width={3072}
            height={238}
            className="absolute inset-0 h-full w-full object-cover"
            unoptimized
          />
          <div className="relative flex flex-col gap-6 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8">
            <ul className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {FOREST_STATS.map((item) => (
                <li key={item.detail} className="flex items-center gap-2.5">
                  <StatIcon name={item.icon} />
                  <span
                    className="text-xs font-bold leading-tight"
                    style={{ color: PAPER }}
                  >
                    <span className="block font-black">{item.label}</span>
                    {item.detail}
                  </span>
                </li>
              ))}
            </ul>
            <div className="shrink-0 text-center lg:text-right">
              <button
                type="button"
                onClick={() => onJoin("register")}
                className="inline-flex items-center rounded-full bg-s4p-mark px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-950 hover:brightness-110"
              >
                Join the S4P community →
              </button>
              <p
                className="mt-2 text-[0.7rem] font-semibold"
                style={{ color: PAPER }}
              >
                Free to join. No ticket required.
                <br />
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => onJoin("login")}
                  className="underline decoration-s4p-mark underline-offset-2 hover:text-s4p-mark"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
