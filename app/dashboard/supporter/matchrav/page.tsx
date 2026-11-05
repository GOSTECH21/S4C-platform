import { redirect } from "next/navigation";
import { SUPPORTER_MATCHRAV_PATH } from "@/app/lib/routes";

export default function MatchravCanonicalRedirect() {
  redirect(SUPPORTER_MATCHRAV_PATH);
}
