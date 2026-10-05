import { redirect } from "next/navigation";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function RemovedFanSponsorPage() {
  redirect(SUPPORTER_CAMPAIGN_PATH);
}
