import {
  formatMilesFromStadium,
  siteForProject,
  stadiumSiteForClub,
  milesBetweenPostcodes,
  NEARBY_STADIUM_MILES,
} from "@/app/lib/project-site";

export function ProjectSiteLine({
  project,
  clubName,
}: {
  project: {
    name?: string | null;
    location?: string | null;
    postcode?: string | null;
    address?: string | null;
  };
  clubName?: string | null;
}) {
  const site = siteForProject(project);
  if (!site) return null;
  const stadium = stadiumSiteForClub(clubName);
  const miles = stadium
    ? milesBetweenPostcodes(site.postcode, stadium.postcode)
    : null;
  const nearby =
    miles != null && miles <= NEARBY_STADIUM_MILES
      ? formatMilesFromStadium(Math.round(miles * 10) / 10)
      : null;
  return (
    <p className="text-sm text-emerald-300">
      📍 {site.address ? `${site.address}, ` : ""}
      {site.postcode}
      {nearby ? ` · ${nearby}` : ""}
    </p>
  );
}
