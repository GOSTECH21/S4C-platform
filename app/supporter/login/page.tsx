"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  FAN_REGISTER_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";

export default function SupporterLoginPage() {
  return (
    <RoleLoginForm
      title="Fan Login"
      subtitle="Sign in to My S4P to vote on your club's climate projects."
      destination={SUPPORTER_CAMPAIGN_PATH}
      registerHref={FAN_REGISTER_PATH}
    />
  );
}
