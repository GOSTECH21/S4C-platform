"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  PARTNER_DASHBOARD_PATH,
  PARTNER_REGISTER_PATH,
} from "@/app/lib/routes";

export default function PartnerLoginPage() {
  return (
    <RoleLoginForm
      title="Climate Partner Login"
      subtitle="Sign in to publish and upload climate projects for Sustainability Directors."
      destination={PARTNER_DASHBOARD_PATH}
      registerHref={PARTNER_REGISTER_PATH}
    />
  );
}
