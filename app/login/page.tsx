import { redirect } from "next/navigation";
import { HOME_PATH } from "@/app/lib/routes";

// Login is role-specific from the homepage cards (Fan, Club, Sponsor, Partner).
// The old generic /login page was a leftover development screen.
export default function LoginAliasPage() {
  redirect(HOME_PATH);
}
