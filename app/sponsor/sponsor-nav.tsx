"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";

export function SponsorNav() {
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

  if (loggedIn) {
    return (
      <Link
        href={SPONSOR_DASHBOARD_PATH}
        className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-[0_0_0_4px_rgba(52,211,153,0.25)] hover:bg-emerald-300"
      >
        Dashboard
      </Link>
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
