import { redirect } from "next/navigation";
import { SUPPORTER_CLIMATE_SPONSORS_PATH } from "@/app/lib/routes";

export default function ClimateSponsorsCanonicalRedirect() {
  redirect(SUPPORTER_CLIMATE_SPONSORS_PATH);
}
