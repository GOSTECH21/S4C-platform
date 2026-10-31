"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_CALENDAR_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_GAME_TIME_PATH,
  SPONSOR_INVITATIONS_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import {
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import { s4pTabClass } from "@/app/lib/s4p-tabs";
import { sponsorInvitationsNavLabel } from "@/app/lib/sponsor-listings";
import { inviteCountWaitingForBrand } from "@/app/services/sponsor-listings.service";
import { hydrateLocalSponsorRecords } from "@/app/services/local-sponsor.service";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";

const tabClass = "rounded-lg px-5 py-2 text-sm font-bold";

export function SponsorNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [homePath, setHomePath] = useState(SPONSOR_DASHBOARD_PATH);
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function resolveHome() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
        await hydrateLocalSponsorRecords({
          brandName,
          sponsor,
        });
        rememberLocalSponsorSession(sponsor);
        if (!mounted) return;
        setHomePath(
          sponsorHomePath(brandName, {
            jobTitle: String(sponsor.industry ?? ""),
          })
        );
        setInviteCount(inviteCountWaitingForBrand(brandName));
      } catch {
        if (!mounted) return;
        try {
          const raw = window.localStorage.getItem("s4p.sponsor.profile");
          if (!raw) return;
          const parsed = JSON.parse(raw) as {
            companyName?: string;
            jobTitle?: string;
            tier?: string;
          };
          const brandName = parsed.companyName ?? "";
          setHomePath(
            sponsorHomePath(brandName, {
              jobTitle: parsed.jobTitle,
            })
          );
          setInviteCount(inviteCountWaitingForBrand(brandName));
        } catch {
          setHomePath(SPONSOR_DASHBOARD_PATH);
        }
      }
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setLoggedIn(Boolean(data.session));
      if (data.session) void resolveHome();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      if (session) void resolveHome();
      else {
        setHomePath(SPONSOR_DASHBOARD_PATH);
        setInviteCount(0);
      }
    });
    function refreshCount() {
      void resolveHome();
    }
    window.addEventListener("storage", refreshCount);
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, refreshCount);
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      window.removeEventListener("storage", refreshCount);
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, refreshCount);
    };
  }, []);

  async function logout() {
    await logoutSponsor();
    setLoggedIn(false);
    setHomePath(SPONSOR_DASHBOARD_PATH);
    setInviteCount(0);
    router.push(SPONSOR_LOGIN_PATH);
  }

  const onInvitations = (pathname ?? "").startsWith(SPONSOR_INVITATIONS_PATH);
  const onCalendar = (pathname ?? "").startsWith(SPONSOR_CALENDAR_PATH);
  const onGameTime = (pathname ?? "").startsWith(SPONSOR_GAME_TIME_PATH);
  const onDashboard =
    !onInvitations &&
    !onCalendar &&
    !onGameTime &&
    ((pathname ?? "") === homePath ||
      (pathname ?? "") === SPONSOR_DASHBOARD_PATH ||
      (pathname ?? "") === LOCAL_SPONSOR_HOME_PATH);

  if (loggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={homePath || LOCAL_SPONSOR_HOME_PATH}
          className={`${tabClass} ${s4pTabClass(onDashboard)}`}
        >
          Dashboard
        </Link>
        {homePath === SPONSOR_DASHBOARD_PATH ? (
          <>
            <Link
              href={SPONSOR_CALENDAR_PATH}
              className={`${tabClass} ${s4pTabClass(onCalendar)}`}
            >
              Calendar
            </Link>
            <Link
              href={SPONSOR_GAME_TIME_PATH}
              className={`${tabClass} ${s4pTabClass(onGameTime)}`}
            >
              Game-Time
            </Link>
          </>
        ) : null}
        <Link
          href={SPONSOR_INVITATIONS_PATH}
          className={`${tabClass} ${s4pTabClass(onInvitations)}`}
        >
          {sponsorInvitationsNavLabel(inviteCount)}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className={`${tabClass} bg-red-500 text-white hover:bg-red-600`}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href={SPONSOR_REGISTER_PATH} className="hover:text-white">
        Register as Sponsor
      </Link>
      <Link href={SPONSOR_LOGIN_PATH} className="hover:text-white">
        Login
      </Link>
    </>
  );
}
