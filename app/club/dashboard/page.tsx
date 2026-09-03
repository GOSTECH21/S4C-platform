"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [club, setClub] = useState<any>(null);
const [account, setAccount] = useState<any>(null);
const [projects, setProjects] = useState<any[]>([]);
const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);

async function loadPortfolio(clubId: string) {
  const { data, error } = await supabase
    .from("club_match_portfolio")
    .select(
      `
      id,
      climate_projects (
        id,
        name,
        description
      )
    `
    )
    .eq("club_id", clubId);

  if (!error) {
    setPortfolioProjects(data || []);
  }
}
function isProjectSelected(projectId: string) {
  return portfolioProjects.some(
    (item: any) => item.project_id === projectId
  );
}
async function addProjectToPortfolio(projectId: string) {
  if (!account) return;

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
  .eq("featured", true)
  .eq("status", "active")
  .limit(1);

setFeaturedProjects(featured || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/club/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading Dashboard...
      </main>
    );
  }

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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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

          <div className="grid gap-4 md:grid-cols-2">

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
<div className="mt-12 grid gap-8 lg:grid-cols-2">

  {featuredProjects.map((project) => {

    const selected = portfolioProjects.some(
      (item: any) => item.project_id === project.id
    );
 
    return (

      <div
        key={project.id}
        className="rounded-2xl border-2 border-green-500 bg-slate-800 p-8 flex flex-col h-full"
      >

        <span className="inline-flex rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
          ⭐ FEATURED CLIMATE PROJECT
        </span>

        <h3 className="mt-6 text-3xl font-bold text-white">
          {project.name}
        </h3>

        <p className="mt-5 text-lg leading-8 text-slate-300">
          {project.description}
        </p>

        <button
          disabled={selected}
          onClick={() =>
 addProjectToPortfolio(project.id)}
          
          className={`mt-10 w-full rounded-xl py-4 text-lg font-bold ${
            selected
              ? "bg-slate-600 text-slate-300 cursor-not-allowed"
              : "bg-green-500 text-black hover:bg-green-400"
          }`}
      
        >
          {selected
            ? "✓ Added to Match Day Portfolio"
            : "➕ Add to Match Day Portfolio"}
        </button>

      </div>

    );

  })}
 
<div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 flex flex-col justify-between h-full">

  <div>
    <h3 className="text-3xl font-bold text-white">
      Create Your Club's Own Climate Project
    </h3>

    <p className="mt-5 text-lg text-slate-300">
      Can't find a suitable climate project?
    </p>

    <p className="mt-4 leading-7 text-slate-400">
      Create a unique climate project for your club and offer it to supporters as part of your Match Day Climate Portfolio.
    </p>
  
 </div>
  <div className="mt-10">
    <button
      className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-500"
      onClick={() => router.push("/club/projects/new")}
    >
      + Create New Climate Project
    </button>
  </div>
</div>
</div>
<div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800 p-8">

    <h3 className="text-3xl font-bold text-white">
        Your Match Day Portfolio
    </h3>

    {portfolioProjects.length === 0 ? (

        <p className="mt-6 text-slate-400">
            No projects selected yet.
        </p>

    ) : (

        <div className="mt-6 space-y-4">

            {portfolioProjects.map((item: any) => (

  <div
    key={item.id}
    className="rounded-xl bg-slate-700 p-5 flex items-center justify-between"
  >

    <div>
      <h4 className="text-xl font-bold text-green-400">
        {item.climate_projects.name}
      </h4>

      <p className="mt-2 text-slate-300">
        {item.climate_projects.description}
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

        </div>

    )}

</div>
</section>
</div>
     
     
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