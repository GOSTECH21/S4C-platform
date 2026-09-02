import Link from "next/link";

const userTypes = [
  {
    emoji: "👤",
    title: "A Fan",
    description:
      "Support your favourite club, earn Climate Credits and help fund verified climate projects.",
    register: "/fan/register",
    login: "/fan/login",
    registerText: "Join as a Fan",
  },
  {
    emoji: "🏟️",
    title: "A Sports Club",
    description:
      "Create Climate Sponsorship Projects, engage your supporters and compete in the Climate Impact League.",
    register: "/club/register",
    login: "/club/login",
    registerText: "Register Your Club",
  },
  {
    emoji: "🏢",
    title: "A Climate Sponsor",
    description:
      "Sponsor sporting moments and create measurable environmental impact through verified climate action.",
    register: "/sponsor/register",
    login: "/sponsor/login",
    registerText: "Become a Climate Sponsor",
  },
  {
    emoji: "🌍",
    title: "A Climate Partner",
    description:
      "Register your climate programme and receive Climate Credits from fans, clubs and sponsors.",
    register: "/partner/register",
    login: "/partner/login",
    registerText: "Register as a Climate Partner",
  },
];

export default function UserTypeCards() {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
      {userTypes.map((type) => (
        <div
          key={type.title}
          className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-900 p-10 shadow-lg transition hover:border-green-500"
        >
          <div className="text-5xl">{type.emoji}</div>

          <h3 className="mt-6 text-2xl font-bold text-white">
            {type.title}
          </h3>

          <p className="mt-4 flex-1 leading-7 text-slate-400">
            {type.description}
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href={type.register}
              className="block rounded-xl bg-green-500 py-3 text-center font-semibold text-black transition hover:bg-green-400"
            >
              {type.registerText}
            </Link>

            <Link
              href={type.login}
              className="block rounded-xl border border-slate-600 py-3 text-center text-white transition hover:bg-slate-800"
            >
              Already registered? Login
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}