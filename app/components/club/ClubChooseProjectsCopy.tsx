import { clubDashboardClimateProjectsIntroCopy } from "@/app/lib/partner-projects";

export default function ClubChooseProjectsCopy({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-lg leading-7 text-slate-300 sm:text-xl ${className}`}>
      {clubDashboardClimateProjectsIntroCopy()}
    </p>
  );
}
