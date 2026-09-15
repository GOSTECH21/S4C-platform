"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_REGISTER_PATH,
} from "@/app/lib/routes";

export default function ClubLoginPage() {
  return (
    <RoleLoginForm
      title="Club Login"
      subtitle="Sign in as your club's Sustainability Director."
      destination={CLUB_DASHBOARD_PATH}
      registerHref={CLUB_REGISTER_PATH}
    />
  );
}
