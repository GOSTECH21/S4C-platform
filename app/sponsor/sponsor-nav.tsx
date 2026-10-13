"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import {
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";

const tabClass = "rounded-lg px-5 py-2 text-sm font-bold";

export function SponsorNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [homePath, setHomePath] = useState(SPONSOR_DASHBOARD_PATH);

  useEffect(() => {
    let mounted = true;
    async function resolveHome() {
      try {
        const sponsor = await getCurrentSponsor();
        rememberLocalSponsorSession(sponsor);
        if (!mounted) return;
        setHomePath(
          sponsorHomePath(String(sponsor.name ?? ""), {
            jobTitle: String(sponsor.industry ?? ""),
          })
        );
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
          setHomePath(
            sponsorHomePath(parsed.companyName, {
              jobTitle: parsed.jobTitle,
            })
          );
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
      else setHomePath(SPONSOR_DASHBOARD_PATH);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await logoutSponsor();
    setLoggedIn(false);
    setHomePath(SPONSOR_DASHBOARD_PATH);
    router.push(SPONSOR_LOGIN_PATH);
  }

  if (loggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={homePath || LOCAL_SPONSOR_HOME_PATH}
          className={`${tabClass} bg-s4p-mark text-slate-950 hover:brightness-110`}
        >
          Dashboard
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
