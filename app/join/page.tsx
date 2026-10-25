import { redirect } from "next/navigation";

/** Old bookmarks and join CTAs that still point at /join. */
export default function JoinPage() {
  redirect("/?join=register");
}
