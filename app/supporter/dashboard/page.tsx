"use client";

import dynamic from "next/dynamic";

const FanMyTeamsPanel = dynamic(
  () => import("@/app/components/fan/FanMyTeamsPanel"),
  { ssr: false }
);
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
