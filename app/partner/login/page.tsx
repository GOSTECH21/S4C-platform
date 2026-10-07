"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  PARTNER_DASHBOARD_PATH,
  PARTNER_REGISTER_PATH,
} from "@/app/lib/routes";

export default function PartnerLoginPage() {
  return (
    <RoleLoginForm
      role="partner"
      title="Climate Partner Login"
      subtitle="Sign in to fill, sign and list your Climate Project on S4P."
      destination={PARTNER_DASHBOARD_PATH}
      registerHref={PARTNER_REGISTER_PATH}
    />
  );
}
