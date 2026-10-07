"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  FAN_REGISTER_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";
import {
  destinationForSignedInKind,
  fanLoginWrongRoleMessage,
  isFanFacingKind,
} from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";

export default function SupporterLoginPage() {
  return (
    <RoleLoginForm
      role="fan"
      title="Fan Login"
      subtitle="Sign in to My S4P to FUND up to 5 Projects shown to you."
      destination={SUPPORTER_CAMPAIGN_PATH}
      registerHref={FAN_REGISTER_PATH}
      afterSignIn={async () => {
        const kind = (await identifySignedInKind()) ?? "unknown";
        if (isFanFacingKind(kind)) return null;
        const dest = destinationForSignedInKind(kind);
        if (dest) window.location.replace(dest);
        return fanLoginWrongRoleMessage(kind);
      }}
    />
  );
}
