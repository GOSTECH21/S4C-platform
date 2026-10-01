"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_REGISTER_PATH,
} from "@/app/lib/routes";
import { requireS4PStaff } from "@/app/services/signed-in-role.service";

export function S4PStaffGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(
    pathname === ADMIN_LOGIN_PATH || pathname === ADMIN_REGISTER_PATH
  );

  useEffect(() => {
    const publicPath =
      pathname === ADMIN_LOGIN_PATH || pathname === ADMIN_REGISTER_PATH;
    if (publicPath) {
      setAllowed(true);
      return;
    }
    let cancelled = false;
    requireS4PStaff().then((staff) => {
      if (cancelled) return;
      if (!staff) {
        router.replace(ADMIN_LOGIN_PATH);
        return;
      }
      setAllowed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Checking S4P staff access...</p>
      </main>
    );
  }

  return <>{children}</>;
}
