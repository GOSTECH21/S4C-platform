"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";

const tabClass = "rounded-lg px-5 py-2 text-sm font-bold";

export function SponsorNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setLoggedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await logoutSponsor();
    setLoggedIn(false);
    router.push(SPONSOR_LOGIN_PATH);
  }

  if (loggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={SPONSOR_DASHBOARD_PATH}
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
