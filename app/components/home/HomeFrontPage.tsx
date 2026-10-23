"use client";

import { useEffect, useState } from "react";
import HomeTopBanner from "@/app/components/home/HomeTopBanner";
import HomeJoinMission from "@/app/components/home/HomeJoinMission";
import HowItWorks from "@/app/components/home/HowItWorks";
import HomeRoleSection from "@/app/components/home/HomeRoleSection";

const JOIN_SECTION_ID = "are-you";

type JoinIntent = "login" | "register";

function joinIntentFromLocation(): JoinIntent | null {
  if (typeof window === "undefined") return null;
  const join = new URLSearchParams(window.location.search).get("join");
  if (join === "login" || join === "register") return join;
  if (window.location.hash === "#login") return "login";
  if (window.location.hash === "#register") return "register";
  return null;
}

export default function HomeFrontPage() {
  const [joinIntent, setJoinIntent] = useState<JoinIntent>("register");

  function showJoin(intent: JoinIntent) {
    setJoinIntent(intent);
    window.requestAnimationFrame(() => {
      document
        .getElementById(JOIN_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    const fromLocation = joinIntentFromLocation();
    if (!fromLocation) return;
    setJoinIntent(fromLocation);
    window.requestAnimationFrame(() => {
      document
        .getElementById(JOIN_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="relative text-white">
      <HomeTopBanner>
        <div
          role="tablist"
          aria-label="Login or Register"
          className="flex shrink-0 items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={joinIntent === "login"}
            onClick={() => showJoin("login")}
            className={`rounded-full border px-5 py-2 text-sm font-bold ${
              joinIntent === "login"
                ? "border-s4p-mark bg-s4p-paper text-slate-950"
                : "border-emerald-400/50 bg-s4p-paper hover:bg-s4p-mark/20"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={joinIntent === "register"}
            onClick={() => showJoin("register")}
            className="rounded-full bg-s4p-mark px-5 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Register
          </button>
        </div>
      </HomeTopBanner>
      <div className="relative flex flex-col">
        <HomeJoinMission />

        <HowItWorks
          onCreateAccount={() => showJoin("register")}
          onLogin={() => showJoin("login")}
        />

        <HomeRoleSection joinIntent={joinIntent} onJoin={showJoin} />
      </div>
    </div>
  );
}
