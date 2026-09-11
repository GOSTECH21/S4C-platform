import { redirect } from "next/navigation";
import { CLUB_SELECT_PROJECTS_PATH } from "@/app/lib/routes";

export default function NewClimateProjectRedirectPage() {
  redirect(CLUB_SELECT_PROJECTS_PATH);
}
