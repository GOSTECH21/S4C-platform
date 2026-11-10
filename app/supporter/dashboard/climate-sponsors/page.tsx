"use client";

import { useEffect } from "react";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function ClimateSponsorsRedirect() {
  useEffect(() => {
    window.location.replace(SUPPORTER_CAMPAIGN_PATH);
  }, []);
  return <p className="p-8 text-slate-400">Opening Climate Projects on My S4P...</p>;
}
