"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FAN_LOGIN_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";
import { fanWelcomeMessage, welcomeBackMessage } from "@/app/lib/s4p-admin";
import {
  destinationForSignedInKind,
  isFanFacingKind,
} from "@/app/lib/signed-in-role";
import { FanTabBar } from "./FanTabBar";

export default function FanNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [welcome, setWelcome] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ supabase }, { identifySignedInKind }, { getOrCreateSupporter }] =
        await Promise.all([
          import("@/app/lib/supabase"),
          import("@/app/services/signed-in-role.service"),
          import("@/app/services/votes.service"),
        ]);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const kind = await identifySignedInKind();
      if (!cancelled && kind && !isFanFacingKind(kind)) {
        const dest = destinationForSignedInKind(kind);
        if (dest) {
          router.replace(dest);
          return;
        }
      }
      const metadataName =
        (user?.user_metadata?.full_name as string | undefined) ||
        `${user?.user_metadata?.first_name ?? ""} ${user?.user_metadata?.last_name ?? ""}`.trim();
      if (!cancelled) {
        const fromMeta = welcomeBackMessage(metadataName);
        if (fromMeta) setWelcome(fromMeta);
      }
      try {
        const current = await getOrCreateSupporter();
        if (cancelled) return;
        setWelcome(
          fanWelcomeMessage(current?.full_name, current?.email, metadataName)
        );
      } catch {
        if (!cancelled) {
          setWelcome(welcomeBackMessage(metadataName));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    const { supabase } = await import("@/app/lib/supabase");
    await supabase.auth.signOut();
    router.push(FAN_LOGIN_PATH);
  }

  return (
    <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link href={SUPPORTER_CAMPAIGN_PATH} className="flex flex-col">
        <span className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-green-400">
            S4P
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Supporter
          </span>
        </span>
        {welcome && (
          <span className="mt-1 text-sm font-medium text-slate-300">
            {welcome}
          </span>
        )}
      </Link>

      <FanTabBar pathname={pathname} onLogout={() => void logout()} />
    </header>
  );
}
