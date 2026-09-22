import Link from "next/link";
import { HOME_STAKEHOLDERS } from "@/app/lib/home-stakeholders";

export default function UserTypeCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
      {HOME_STAKEHOLDERS.map((type) => (
        <div
          key={type.title}
          className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-lg transition hover:border-green-500"
        >
          <h3 className="text-2xl font-bold text-white">{type.title}</h3>
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
              {type.loginText}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
