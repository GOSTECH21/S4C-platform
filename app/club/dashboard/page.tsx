"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import FeaturedProject from "@/app/components/dashboard/FeaturedProject";

export default function ClubDashboardPage() {
      const router = useRouter();
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [club, setClub] = useState<any>(null);
const [account, setAccount] = useState<any>(null);
const [projects, setProjects] = useState<any[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
const [libraryProjects, setLibraryProjects] = useState<any[]>([]);
const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

function toggleProject(id: string) {

    if (portfolioProjects.includes(id)) {

        setSelectedProjects(
           portfolioProjects .filter(projectId => projectId !== id)
        );

        return;
    }

    if (portfolioProjects.length >= 5) return;

    setSelectedProjects([...portfolioProjects, id]);

}
async function loadPortfolio(clubId: string) {
  const { data, error } = await supabase
    .from("club_match_portfolio")
    .select(`
      *,
      climate_projects!club_match_portfolio_project_id_fkey (
        id,
        name,
        description
      )
    `)
    .eq("club_id", clubId);

  console.log(
  JSON.stringify(data, null, 2)
);

  if (error) {
    console.error(error);
    return;
  }

  setPortfolioProjects(data || []);
}
function isProjectSelected(projectId: string) {
  return portfolioProjects.some(
    (item: any) => item.project_id === projectId
  );
}
async function addProjectToPortfolio(projectId: string) {
  if (!account) return;
  console.log("Portfolio length:", portfolioProjects.length);
if (portfolioProjects.length >= 5) {
  alert("You can only select FIVE climate projects.");
  return;
}

  if (isProjectSelected(projectId)) {
    alert("This project is already in your Match Day Portfolio.");
    return;
  }

  const { error } = await supabase
    .from("club_match_portfolio")
    .insert({
      club_id: account.club_id,
      project_id: projectId,
      status: "selected",
    });

  if (error) {
    console.error(error);
    alert("Project could not be added.");
    return;
  }

  await loadPortfolio(account.club_id);

  alert("✅ Project added to Match Day Portfolio");
}

async function removeProjectFromPortfolio(portfolioId: string) {
  const { error } = await supabase
    .from("club_match_portfolio")
    .delete()
    .eq("id", portfolioId);

  if (error) {
    console.error(error);
    alert("Couldn't remove project.");
    return;
  }

  await loadPortfolio(account.club_id);
}
async function submitPortfolio() {
  if (portfolioProjects.length !== 5) {
    alert("Please select exactly FIVE climate projects.");
    return;
  }

  alert("✅ Match Day Portfolio submitted successfully.");

  // We'll wire the Match Campaign creation here next.
}
   useEffect(() => {
  loadDashboard();
}, []);

useEffect(() => {
  if (account?.club_id) {
    loadPortfolio(account.club_id);
  }
}, [account]);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/club/login");
      return;
    }

    const { data: clubAccount, error: accountError } = await supabase
      .from("club_accounts")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (accountError || !clubAccount) {
      alert("Club account not found.");
      return;
    }

    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubAccount.club_id)
      .single();

    if (clubError || !clubData) {
      alert("Club not found.");
      return;
    }
const { data: climateProjects, error: projectsError } = await supabase
  .from("climate_projects")
  .select("*")
  .order("name");

if (!projectsError) {
  setLibraryProjects(climateProjects || []);
}
    setAccount(clubAccount);
    setClub(clubData);
    setLoading(false);
    await loadPortfolio(clubAccount.club_id);
    const { data: projectData, error: projectError } = await supabase
  .from("climate_projects")
  .select("*")
  .eq("club_id", clubAccount.club_id)
  .order("created_at");

if (!projectError && projectData) {
  setProjects(projectData);
}
const { data: featured } = await supabase
  .from("climate_projects")
  .select("*")
  .limit(1);

setFeaturedProjects(featured || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/club/login");
  }
    const PROJECTS_PER_PAGE = 10;
const totalPages = Math.ceil(
  libraryProjects.length / PROJECTS_PER_PAGE
);

const displayedProjects = libraryProjects.slice(
  (currentPage - 1) * PROJECTS_PER_PAGE,
  currentPage * PROJECTS_PER_PAGE
);
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading Dashboard...
      </main>
      
    );
  }
const selectedPortfolioProjects = portfolioProjects;

return (
  <main className="min-h-screen bg-slate-950 p-10 text-white">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-black">
              {club.name}
            </h1>

            <p className="mt-2 text-slate-400">
              Welcome to your Score-4-Our-Planet Club Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold"
          >
            Logout
          </button>
</div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 xl:grid-cols-4">

          <DashboardCard
            title="Status"
            value={account.status}
          />

          <DashboardCard
            title="Supporters"
            value={account.supporter_base}
          />

          <DashboardCard
            title="Attendance"
            value={account.average_attendance}
          />

          <DashboardCard
            title="Country"
            value={club.country}
          />

        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Club Representative
          </h2>

          <div className="grid gap-4 md:grid-cols-4">

            <Info label="Name">
              {account.first_name} {account.last_name}
            </Info>

            <Info label="Role">
              {account.job_title}
            </Info>

            <Info label="Email">
              {account.email}
            </Info>

            <Info label="Phone">
              {account.phone}
            </Info>

          </div>

        </div>
<div className="mt-10">

  <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-10">

  <div className="text-center">

    <h2 className="text-5xl font-black text-white">
  Choose Climate Projects for Your Next Match
</h2>

<p className="mt-4 text-xl text-slate-300">
  Choose the climate projects that your supporters will be able to support during your next match.
</p>

  </div>
<div className="mt-12 mb-12">

  {featuredProjects.map((project: any) => (
  <FeaturedProject
    key={project.id}
    project={project}
    selected={portfolioProjects.some(
      (item: any) => item.project_id === project.id
    )}
    addProjectToPortfolio={addProjectToPortfolio}
  />
))}
</div>
<h3 className="text-3xl font-bold text-white">
  Climate Project Library
</h3>

<p className="mt-2 text-slate-300">
  Select FIVE approved climate projects for supporters to vote on.
</p>

<p className="mt-4 font-semibold text-green-400">
  Selected: {portfolioProjects.length} / 5
</p>
 <div className="mt-6 flex items-center justify-between">

  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className="rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
  >
    ← Previous
  </button>

  <div className="text-center">

    <p className="text-sm text-slate-400">
      Showing {(currentPage - 1) * PROJECTS_PER_PAGE + 1}
      {" - "}
      {Math.min(currentPage * PROJECTS_PER_PAGE, libraryProjects.length)}
      {" of "}
      {libraryProjects.length}
      {" projects"}
    </p>

    <p className="mt-1 font-semibold text-green-400">
      Page {currentPage} of {totalPages}
    </p>

  </div>

  <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
  >
    Next →
  </button>

</div>
   <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

  {displayedProjects.map((project) => {
  const isSelected = portfolioProjects.some(
    (item: any) => item.project_id === project.id
  );

  return (
        <div
    key={project.id}
   onClick={() =>
  isSelected
    ? removeProjectFromPortfolio(
        portfolioProjects.find(
          p => p.project_id === project.id
        )!.id
      )
    : addProjectToPortfolio(project.id)
}
    className={`cursor-pointer rounded-xl border p-5 transition ${
   isSelected
        ? "border-green-500 bg-slate-800"
        : "border-slate-700 bg-slate-900 hover:border-green-500"
}`}
>

    <div className="flex justify-between items-start">

        <div>

            <h4 className="text-xl font-bold text-white">
                {project.name}
            </h4>

            <p className="mt-1 text-slate-400">
                {project.country}
            </p>

            <p className="text-slate-500">
                {project.category}
            </p>

            <p className="mt-2 text-green-400">
                CO₂ Reduction: {project.co2_reduction} tonnes
            </p>

        </div>

        <input
    type="checkbox"
    checked={portfolioProjects.some(
    (item: any) => item.project_id === project.id
)}
    onChange={() => toggleProject(project.id)}
    className="h-6 w-6"
/>
    </div>

</div>
  );
})}

</div>
<div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800 p-8">

  <h3 className="text-3xl font-bold text-white">
    Your Match Day Portfolio
  </h3>

  {selectedPortfolioProjects.length === 0 ? (

    <p className="mt-6 text-slate-400">
      No projects selected yet.
    </p>

  ) : (

    <div className="mt-6 space-y-4">

      {selectedPortfolioProjects.map((item: any) => (

        <div
          key={item.id}
          className="rounded-xl bg-slate-700 p-5 flex items-center justify-between"
        >
          <div>
          
            <h4 className="text-xl font-bold text-green-400">
              {item.climate_projects?.name}
            </h4>

            <p className="mt-2 text-slate-300">
              {item.climate_projects?.description}
            </p>

          </div>

          <button
            onClick={() => removeProjectFromPortfolio(item.id)}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
          >
            Remove
          </button>

        </div>

      ))}
{portfolioProjects.length === 5 && (
  <div className="mt-8 flex justify-end">
    <button
      onClick={submitPortfolio}
      className="rounded-xl bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-500"
    >
      Submit Portfolio
    </button>
  </div>
)}
        </div>

  )}

</div>

</section>

</div>

</main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  
  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-green-400">
        {value}
      </p>
    </div>
  );
}
function ActionItem({
  complete,
  text,
}: {
  complete: boolean;
  text: string;
}) {
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-5 py-4">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
            complete
              ? "bg-green-500 text-black"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {complete ? "✓" : "○"}
        </div>

        <span className="text-lg text-white">
          {text}
        </span>

      </div>

    </div>
  );
}
function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-lg">{children}</p>
    </div>
  );
}