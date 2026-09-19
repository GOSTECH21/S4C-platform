import { redirect } from "next/navigation";

// Convenience redirect: the supporter pages are canonically served under
// /dashboard/supporter/*. Some links/bookmarks use the swapped segment order
// (/supporter/dashboard/*); send those to the canonical route. This lives as a
// real route (not just a next.config redirect) so it is picked up by dev
// hot-reload without needing a dev-server restart.
type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function SupporterDashboardRedirect({ params }: Props) {
  const { path } = await params;
  redirect(`/dashboard/supporter/${(path ?? []).join("/")}`);
}
