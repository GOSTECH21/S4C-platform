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
      <HomeTopBanner
        joinIntent={joinIntent}
        onLogin={() => showJoin("login")}
        onJoinFree={() => showJoin("register")}
        onJoinCommunity={() => showJoin("register")}
      />
      <div className="relative flex flex-col">
        <HomeJoinMission />

        <div className="hidden md:block" data-how-s4p-desktop="true">
          <HowItWorks
            onCreateAccount={() => showJoin("register")}
            onLogin={() => showJoin("login")}
          />
        </div>

        <HomeRoleSection joinIntent={joinIntent} onJoin={showJoin} />
      </div>
    </div>
  );
}
