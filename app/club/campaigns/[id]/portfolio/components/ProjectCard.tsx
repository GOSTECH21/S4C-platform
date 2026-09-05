interface ProjectCardProps {
  project: any;
  selected: boolean;
  onToggle: () => void;
}

export default function ProjectCard({
  project,
  selected,
  onToggle,
}: ProjectCardProps) {
  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all ${
        selected
          ? "border-green-500 bg-green-900/20"
          : "border-slate-700 bg-slate-800"
      }`}
    >
      <h3 className="text-2xl font-bold text-white">
        {project.name}
      </h3>

      <p className="mt-4 leading-7 text-slate-300">
        {project.description}
      </p>

      <button
        onClick={onToggle}
        className={`mt-8 w-full rounded-xl py-3 font-bold ${
          selected
            ? "bg-green-500 text-black"
            : "bg-slate-700 text-white hover:bg-slate-600"
        }`}
      >
        {selected ? "✓ Selected" : "Select Project"}
      </button>
    </div>
  );
}