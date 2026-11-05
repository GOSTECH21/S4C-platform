"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  fanRegisterPath,
  SUPPORTER_HOME_PATH,
  safeFanReturnPath,
} from "@/app/lib/routes";
import { captureClimateInviteFromSearch } from "@/app/lib/climate-funding";
import {
  destinationForSignedInKind,
  fanLoginWrongRoleMessage,
  isFanFacingKind,
} from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";

function FanLoginForm() {
  const searchParams = useSearchParams();
  const destination =
    safeFanReturnPath(searchParams.get("next")) ?? SUPPORTER_HOME_PATH;

  useEffect(() => {
    captureClimateInviteFromSearch();
  }, []);

  return (
    <RoleLoginForm
      role="fan"
      title="Fan Login"
      subtitle="Sign in to My S4P to FUND up to 5 Projects shown to you."
      destination={destination}
      registerHref={fanRegisterPath(destination)}
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

export default function FanLoginPage() {
  return (
    <Suspense
      fallback={
        <RoleLoginForm
          role="fan"
          title="Fan Login"
          subtitle="Sign in to My S4P to FUND up to 5 Projects shown to you."
          destination={SUPPORTER_HOME_PATH}
          registerHref={fanRegisterPath(SUPPORTER_HOME_PATH)}
        />
      }
    >
      <FanLoginForm />
    </Suspense>
  );
}
