"use client";

import { useEffect } from "react";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function SupporterPreferencesRedirect() {
  useEffect(() => {
    window.location.replace(`${SUPPORTER_CAMPAIGN_PATH}#my-teams`);
  }, []);
  return (
    <p className="p-8 text-slate-400">Opening My Teams on My S4P...</p>
  );
}
