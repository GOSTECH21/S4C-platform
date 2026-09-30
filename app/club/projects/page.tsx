import { redirect } from "next/navigation";
import { CLUB_SELECT_PROJECTS_PATH } from "@/app/lib/routes";

export default function ClubProjectsIndexRedirect() {
  redirect(CLUB_SELECT_PROJECTS_PATH);
}
