"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  ADMIN_CATALOGUE_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_PATH,
  ADMIN_REGISTER_PATH,
} from "@/app/lib/routes";
import { s4pTabClass } from "@/app/lib/s4p-tabs";
import { welcomeBackMessage } from "@/app/lib/s4p-admin";
import { ADMIN_MOBILE_STAMP } from "@/app/lib/admin-backend";
import { requireS4PStaff } from "@/app/services/signed-in-role.service";
import { useEffect, useState } from "react";

const LINKS = [
  { href: ADMIN_PATH, label: "Backend", match: "backend" as const },
  { href: ADMIN_CATALOGUE_PATH, label: "Catalogue", match: "catalogue" as const },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [welcome, setWelcome] = useState("S4P staff");

  useEffect(() => {
    requireS4PStaff().then((staff) => {
      setWelcome(welcomeBackMessage(staff?.fullName) ?? "S4P staff");
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push(ADMIN_LOGIN_PATH);
  }

  if (
    pathname === ADMIN_LOGIN_PATH ||
    pathname === ADMIN_REGISTER_PATH
  ) {
    return null;
  }

  return (
    <header
      data-admin-mobile={ADMIN_MOBILE_STAMP}
      className="sticky top-[4.75rem] z-30 mb-4 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:top-[5.25rem] md:hidden"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Admin
      </p>
      <p className="mt-1 text-sm font-medium text-slate-300">{welcome}</p>
      <nav
        aria-label="Admin"
        className="mt-3 flex min-w-0 flex-wrap items-center gap-2"
      >
        {LINKS.map((link) => {
          const active =
            link.match === "backend"
              ? pathname === ADMIN_PATH
              : Boolean(
                  pathname?.startsWith("/admin/") && pathname !== ADMIN_PATH
                );
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${s4pTabClass(active)}`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-s4p-mark bg-s4p-mark/15 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
