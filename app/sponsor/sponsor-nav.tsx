"use client";
/* p4p-rename-game-time-v1 */
/* sponsor-tabs-visible-v1 */
/* sponsor-drop-calendar-v1 */
/* sponsor-nav-pc-fix-v1 */
/* s4p-logo-back-home-v1 */
/* local-mys4p-tab-v1 */
/* invite-tab-flash-v1 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  HOME_PATH,
  LOCAL_SPONSOR_HOME_PATH,
  LOCAL_SPONSOR_MY_S4P_PATH,
  LOCAL_SPONSOR_REGISTER_PATH,
  PHILANTHROPIST_ADMIN_ID,
  PHILANTHROPIST_ADMIN_PATH,
  PHILANTHROPIST_HOME_PATH,
  PHILANTHROPIST_PST_ID,
  PHILANTHROPIST_REGISTER_PATH,
  SPONSOR_CALENDAR_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_GAME_TIME_PATH,
  SPONSOR_INVITATIONS_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import {
  PHILANTHROPIST_ADMIN_NAV,
  PHILANTHROPIST_NAV_REGISTER,
} from "@/app/lib/philanthropist";
import {
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import { inviteTabFlashClass, s4pTabClass } from "@/app/lib/s4p-tabs";
import { sponsorInvitationsNavLabel } from "@/app/lib/sponsor-listings";
import { inviteCountWaitingForBrand } from "@/app/services/sponsor-listings.service";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { GAME_TIME_NAV_LABEL } from "@/app/lib/predict-for-planet";
import { LOCAL_MY_S4P_NAV } from "@/app/lib/local-sponsor-mys4p";

const tabClass =
  "min-w-0 w-full overflow-hidden whitespace-normal rounded-lg px-1 py-2 text-center text-[11px] font-bold leading-tight sm:w-auto sm:px-5 sm:text-sm";

export function SponsorTabBar({
  homePath,
  inviteCount,
  onDashboard,
  onGameTime,
  onInvitations,
  onAdmin = false,
  onMyS4p = false,
  onLogout,
}: {
  homePath: string;
  inviteCount: number;
  onDashboard: boolean;
  onGameTime: boolean;
  onInvitations: boolean;
  onAdmin?: boolean;
  onMyS4p?: boolean;
  onLogout: () => void;
}) {
  const showGameTime = homePath === SPONSOR_DASHBOARD_PATH;
  const showInvitations = true;
  const showAdmin = homePath === PHILANTHROPIST_HOME_PATH;
  const showMyS4p = homePath === LOCAL_SPONSOR_HOME_PATH;
  const tabCount =
    1 +
    (showAdmin ? 1 : 0) +
    (showMyS4p ? 1 : 0) +
    (showGameTime ? 1 : 0) +
    (showInvitations ? 1 : 0) +
    1;

  return (
    <div
      data-testid="sponsor-tab-bar"
      data-sponsor-tabs={String(tabCount)}
      data-sponsor-tabs-visible="sponsor-tabs-visible-v1"
      data-sponsor-drop-calendar="sponsor-drop-calendar-v1"
      data-local-mys4p={showMyS4p ? "local-mys4p-tab-v1" : undefined}
      className={`grid w-full gap-1 overflow-x-hidden sm:flex sm:w-auto sm:items-center sm:gap-2 ${
        tabCount >= 4
          ? "grid-cols-4"
          : tabCount === 3
            ? "grid-cols-3"
            : "grid-cols-2"
      }`}
    >
      <Link
        href={homePath || LOCAL_SPONSOR_HOME_PATH}
        className={`${tabClass} ${s4pTabClass(onDashboard)}`}
      >
        Dashboard
      </Link>
      {showAdmin ? (
        <Link
          href={PHILANTHROPIST_ADMIN_PATH}
          className={`${tabClass} ${s4pTabClass(onAdmin)}`}
          onClick={() => {
            window.setTimeout(() => {
              document.getElementById(PHILANTHROPIST_ADMIN_ID)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 50);
          }}
        >
          {PHILANTHROPIST_ADMIN_NAV}
        </Link>
      ) : null}
      {showMyS4p ? (
        <Link
          href={LOCAL_SPONSOR_MY_S4P_PATH}
          className={`${tabClass} ${s4pTabClass(onMyS4p)}`}
        >
          {LOCAL_MY_S4P_NAV}
        </Link>
      ) : null}
      {showGameTime ? (
        <Link
          href={SPONSOR_GAME_TIME_PATH}
          className={`${tabClass} ${s4pTabClass(onGameTime)}`}
        >
          {GAME_TIME_NAV_LABEL}
        </Link>
      ) : null}
      {showInvitations ? (
        <Link
          href={SPONSOR_INVITATIONS_PATH}
          className={`${tabClass} ${s4pTabClass(onInvitations)} ${inviteTabFlashClass(inviteCount)}`}
          data-invite-flash={inviteCount > 0 ? "pending" : "none"}
          aria-label={
            inviteCount > 0
              ? `${sponsorInvitationsNavLabel(inviteCount)} waiting`
              : sponsorInvitationsNavLabel(inviteCount)
          }
        >
          <span className="s4p-invite-flash-label">
            {sponsorInvitationsNavLabel(inviteCount)}
          </span>
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onLogout}
        className={`${tabClass} bg-red-500 text-white hover:bg-red-600`}
      >
        Logout
      </button>
    </div>
  );
}

export function SponsorNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [homePath, setHomePath] = useState(SPONSOR_DASHBOARD_PATH);
  const [inviteCount, setInviteCount] = useState(0);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function resolveHome() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
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
    const wasLoggedIn = loggedIn;
    await logoutSponsor();
    setLoggedIn(false);
    setHomePath(SPONSOR_DASHBOARD_PATH);
    setInviteCount(0);
    router.push(wasLoggedIn ? SPONSOR_LOGIN_PATH : HOME_PATH);
  }

  const onInvitations = (pathname ?? "").startsWith(SPONSOR_INVITATIONS_PATH);
  const onCalendar = (pathname ?? "").startsWith(SPONSOR_CALENDAR_PATH);
  const onGameTime = (pathname ?? "").startsWith(SPONSOR_GAME_TIME_PATH);
  const onMyS4p = (pathname ?? "").startsWith(LOCAL_SPONSOR_MY_S4P_PATH);
  const onAdmin =
    hash === `#${PHILANTHROPIST_ADMIN_ID}` || hash === `#${PHILANTHROPIST_PST_ID}`;
  const onDashboard =
    !onInvitations &&
    !onCalendar &&
    !onGameTime &&
    !onAdmin &&
    !onMyS4p &&
    ((pathname ?? "") === homePath ||
      (pathname ?? "") === SPONSOR_DASHBOARD_PATH ||
      (pathname ?? "") === LOCAL_SPONSOR_HOME_PATH ||
      (pathname ?? "") === PHILANTHROPIST_HOME_PATH);

  if (loggedIn) {
    return (
      <SponsorTabBar
        homePath={homePath}
        inviteCount={inviteCount}
        onDashboard={onDashboard}
        onGameTime={onGameTime}
        onInvitations={onInvitations}
        onAdmin={onAdmin}
        onMyS4p={onMyS4p}
        onLogout={() => void logout()}
      />
    );
  }

  const onLogin = (pathname ?? "").startsWith(SPONSOR_LOGIN_PATH);
  const onPhilanthropistRegister = (pathname ?? "").startsWith(
    PHILANTHROPIST_REGISTER_PATH
  );
  const onRegister =
    onPhilanthropistRegister ||
    (pathname ?? "").startsWith(SPONSOR_REGISTER_PATH) ||
    (pathname ?? "").startsWith(LOCAL_SPONSOR_REGISTER_PATH);

  return (
    <div
      data-testid="sponsor-tab-bar"
      data-sponsor-tabs="3"
      data-sponsor-logged-out="s4p-logo-back-home-v1"
      className="grid w-full grid-cols-3 gap-1 overflow-x-hidden sm:flex sm:w-auto sm:items-center sm:gap-2"
    >
      <Link
        href={
          onPhilanthropistRegister
            ? PHILANTHROPIST_REGISTER_PATH
            : SPONSOR_REGISTER_PATH
        }
        className={`${tabClass} ${s4pTabClass(onRegister)}`}
      >
        {onPhilanthropistRegister
          ? PHILANTHROPIST_NAV_REGISTER
          : "Register as Sponsor"}
      </Link>
      <Link
        href={SPONSOR_LOGIN_PATH}
        className={`${tabClass} ${s4pTabClass(onLogin)}`}
      >
        Login
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
