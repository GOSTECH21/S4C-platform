"use client";

import { useEffect } from "react";
import {
  SUPPORTER_CLIMATE_SPONSORS_HASH,
  SUPPORTER_PROJECTS_PATH,
} from "@/app/lib/routes";

export default function ClimateSponsorsRedirect() {
  useEffect(() => {
    window.location.replace(
      `${SUPPORTER_PROJECTS_PATH}#${SUPPORTER_CLIMATE_SPONSORS_HASH}`
    );
  }, []);
  return (
    <p className="p-8 text-slate-400">Opening Climate Sponsors on Climate Projects...</p>
  );
}
