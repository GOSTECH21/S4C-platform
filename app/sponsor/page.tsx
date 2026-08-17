import Link from "next/link";

export default function SponsorHomePage() {
  return (
    <div className="space-y-12">

      {/* Hero */}

      <section className="py-20 text-center">

        <h1 className="text-6xl font-extrabold text-slate-900">

          Score-For-Our-Planet

        </h1>

        <p className="mt-6 text-2xl font-semibold text-emerald-700">

          Where Every Sporting Moment Improves Our Planet

        </p>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-gray-600">

          Score-For-Our-Planet (S4P) enables brands to sponsor
          live sporting moments that reward supporters and help
          fund our Global Schools Solar (GSS) Programmes.

        </p>

        <div className="mt-12 flex justify-center gap-6">

          <Link
            href="/sponsor/register"
            className="rounded-lg bg-emerald-600 px-8 py-4 text-white shadow hover:bg-emerald-700"
          >
            Become a Sponsor
          </Link>

          <Link
            href="/sponsor/login"
            className="rounded-lg border border-gray-300 bg-white px-8 py-4 shadow hover:bg-gray-50"
          >
            Sponsor Login
          </Link>

        </div>

      </section>
{/* Why S4P */}

<section className="py-12">

  <h2 className="mb-12 text-center text-4xl font-bold">
    Why Sponsor Through S4P?
  </h2>

  <div className="grid gap-8 md:grid-cols-3">

    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <div className="mb-4 text-5xl">🏆</div>

      <h3 className="mb-3 text-2xl font-semibold">
        Sponsor Live Sporting Moments
      </h3>

      <p className="text-gray-600">
        Connect your brand with unforgettable sporting moments
        that engage millions of supporters.
      </p>
    </div>

    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <div className="mb-4 text-5xl">🌞</div>

      <h3 className="mb-3 text-2xl font-semibold">
        Fund Global Schools Solar (GSS) Programme
      </h3>

      <p className="text-gray-600">
        Every activation helps fund our Global Schools Solar (GSS)
        Programmes, bringing clean energy to schools.
      </p>
    </div>

    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <div className="mb-4 text-5xl">📊</div>

      <h3 className="mb-3 text-2xl font-semibold">
        Measure Impact
      </h3>

      <p className="text-gray-600">
        Track sponsorship performance, supporter engagement
        and environmental outcomes in real time.
      </p>
    </div>

  </div>

</section>
<section className="py-10">

  <div className="mx-auto max-w-4xl text-center">

    <h2 className="mb-8 text-4xl font-bold">

      Our Story

    </h2>

    <p className="text-xl leading-9 text-gray-600">

      Sport has the power to unite communities, inspire generations
      and create unforgettable moments.

      At Score-For-Our-Planet (S4P), we believe every one of those
      moments can create something even bigger.

    </p>

    <p className="mt-8 text-xl leading-9 text-gray-600">

      Every goal. Every try. Every Wicket. Every touchdown. Every sporting moment can help power schools, inspire supporters and build a more sustainable future.

    </p>

  </div>

</section>
    </div>
  );
}