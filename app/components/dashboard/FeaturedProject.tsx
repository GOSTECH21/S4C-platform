"use client";

type FeaturedProjectProps = {
  project: any;
  selected: boolean;
  addProjectToPortfolio: (id: string) => void;
};

export default function FeaturedProject({
  project,
  selected,
  addProjectToPortfolio,
}: FeaturedProjectProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-green-500 bg-gradient-to-r from-slate-900 to-slate-800">

      <div className="grid lg:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="p-12">

          <span className="inline-flex rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black">
            ⭐ FEATURED CLIMATE PROJECT
          </span>

          <h2 className="mt-8 text-5xl font-black text-white">
            {project.name}
          </h2>

          <p className="mt-6 text-xl leading-9 text-slate-300">
            {project.description}
          </p>

          <div className="mt-10 flex gap-5">

            <button className="rounded-xl border border-white px-8 py-4 font-bold text-white hover:bg-white hover:text-black">
              Learn More
            </button>

            <button
              disabled={selected}
              onClick={() => addProjectToPortfolio(project.id)}
              className={`rounded-xl px-8 py-4 font-bold ${
                selected
                  ? "cursor-not-allowed bg-slate-600 text-slate-300"
                  : "bg-green-500 text-black hover:bg-green-400"
              }`}
            >
              {selected ? "✓ Already Added" : "Add to Match Day"}
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="bg-black/20 p-12">

          <div className="grid grid-cols-2 gap-6">

            <div className="rounded-2xl bg-slate-800 p-6">
              <p className="text-slate-400">Countries</p>
              <p className="mt-3 text-4xl font-black text-green-400">
                25
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-6">
              <p className="text-slate-400">Schools</p>
              <p className="mt-3 text-4xl font-black text-green-400">
                250+
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-6">
              <p className="text-slate-400">Students</p>
              <p className="mt-3 text-4xl font-black text-green-400">
                250,000
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-6">
              <p className="text-slate-400">CO₂ Reduction</p>
              <p className="mt-3 text-4xl font-black text-green-400">
                18,000 t
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}