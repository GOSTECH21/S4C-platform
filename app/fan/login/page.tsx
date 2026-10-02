"use client";

import { useEffect } from "react";
import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  FAN_REGISTER_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";
import { captureClimateInviteFromSearch } from "@/app/lib/climate-funding";
import {
  destinationForSignedInKind,
  fanLoginWrongRoleMessage,
  isFanFacingKind,
} from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";

export default function FanLoginPage() {
  useEffect(() => {
    captureClimateInviteFromSearch();
  }, []);
  return (
    <RoleLoginForm
      title="Fan Login"
      subtitle="Sign in to My S4P to FUND-IT up to 5 times — £0.20 once from each Carbon Wallet onto any Climate Project."
      destination={SUPPORTER_CAMPAIGN_PATH}
      registerHref={FAN_REGISTER_PATH}
      afterSignIn={async () => {
        captureClimateInviteFromSearch();
        const kind = (await identifySignedInKind()) ?? "unknown";
        if (isFanFacingKind(kind)) return null;
        const dest = destinationForSignedInKind(kind);
        if (dest) window.location.replace(dest);
        return fanLoginWrongRoleMessage(kind);
      }}
    />
  );
}
