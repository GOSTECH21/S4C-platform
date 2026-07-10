import Link from "next/link";

const projects = [
  {
    name: "Kenya Tree Planting",
    description: "Restore forests and capture carbon.",
  },
  {
    name: "Ocean Plastic Cleanup",
    description: "Remove plastic from rivers and oceans.",
  },
  {
    name: "Mangrove Restoration",
    description: "Protect coastal ecosystems and biodiversity.",
  },
  {
    name: "Solar Schools Africa",
    description: "Provide clean energy to schools.",
  },
];

type PageProps = {
  searchParams: Promise<{
    amount?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const amount = params.amount ?? "1";

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black text-green-400">
          🌳 Choose a Climate Project
        </h1>

        <p className="mt-3 text-slate-300">
          Allocate your £{amount} Climate Credit to one of these verified
          projects.
        </p>

        <div className="mt-10 space-y-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-2xl font-bold">{project.name}</h2>

              <p className="mt-2 text-slate-400">
                {project.description}
              </p>

              <Link
                href={`/dashboard/supporter/success?amount=${amount}`}
                className="mt-5 inline-block rounded-lg bg-green-400 px-5 py-3 font-bold text-slate-950"
              >
                Allocate £{amount}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}