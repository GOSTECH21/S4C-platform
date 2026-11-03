"use client";

import dynamic from "next/dynamic";
import FanMyTeamsPanel from "@/app/components/fan/FanMyTeamsPanel";

const FanCampaignWorkspace = dynamic(
  () =>
    import("@/app/components/fan/FanCampaignWorkspace").then(
      (mod) => mod.FanCampaignWorkspace
    ),
  { ssr: false }
);

export default function MyS4PDashboardPage() {
  return (
    <>
      <FanMyTeamsPanel />
      <FanCampaignWorkspace section="projects" />
    </>
  );
}
