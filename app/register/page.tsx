import { redirect } from "next/navigation";
import { HOME_PATH } from "@/app/lib/routes";

// Registration is role-specific from the homepage cards.
export default function RegisterAliasPage() {
  redirect(HOME_PATH);
}
