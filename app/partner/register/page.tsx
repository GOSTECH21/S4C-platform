"use client";

import RoleRegisterForm from "@/app/components/auth/RoleRegisterForm";
import { PARTNER_LOGIN_PATH } from "@/app/lib/routes";

export default function PartnerRegisterPage() {
  return (
    <RoleRegisterForm
      title="Register as a Climate Partner"
      subtitle="Create your S4P climate partner account."
      role="partner"
      loginHref={PARTNER_LOGIN_PATH}
    />
  );
}
