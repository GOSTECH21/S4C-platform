"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_REGISTER_PATH,
} from "@/app/lib/routes";
import { clubLoginWrongRoleMessage } from "@/app/lib/signed-in-role";
import { loadClubSession } from "@/app/services/club-match-day.service";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";

export default function ClubLoginPage() {
  return (
    <RoleLoginForm
      title="Club Login"
      subtitle="Sign in as your club's Sustainability Director."
      destination={CLUB_DASHBOARD_PATH}
      registerHref={CLUB_REGISTER_PATH}
      afterSignIn={async () => {
        const session = await loadClubSession();
        if (session) return null;
        const kind = (await identifySignedInKind()) ?? "unknown";
        if (kind === "club") return null;
        return clubLoginWrongRoleMessage(kind);
      }}
    />
  );
}
