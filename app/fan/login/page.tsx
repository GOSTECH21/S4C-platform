"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  FAN_REGISTER_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";

export default function FanLoginPage() {
  return (
    <RoleLoginForm
      title="Fan Login"
      subtitle="Sign in to your S4P supporter account to vote on your club's match campaign."
      destination={SUPPORTER_CAMPAIGN_PATH}
      registerHref={FAN_REGISTER_PATH}
    />
  );
}
