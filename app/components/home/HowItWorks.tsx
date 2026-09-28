import type { ReactNode } from "react";

export default function HowItWorks() {
  const steps: Array<{
    number: string;
    title: string;
    description: ReactNode;
  }> = [
    {
      number: "01",
      title: "Compile Climate Projects List",
      description:
        "Clubs compile & publish a list of 5 Climate Projects that helps to address their Match-Day Carbon footprints",
    },
    {
      number: "02",
      title: "Sports Creates Excitement",
      description:
        "Every Score (e.g a GOAL; a TRY; a TOUCHDOWN; a WICKET; a 3-POINT-SCORE) during a Match creates a CLIMATE IMPACT MOMENT & releases Sponsorship Cash",
    },
    {
      number: "03",
      title: "Fans & Supporters Participation",
      description:
        "Fans & Supporters allocates real cash from Sponsor-funded-monies into any preferred Climate Project chosen from the List",
    },
    {
      number: "04",
      title: "Climate Project Partners Participation",
      description:
        "Project Partners receives their allocated cash; Implements the Project on behalf of the Club to mitigate some OR all of that Match-Day's Carbon emissions",
    },
    {
      number: "05",
      title: "Everyone Wins",
      description: (
        <>
          Sponsors gain direct engagement with Fans/Supporters; Clubs address
          their Match-Day Carbon emissions; Fans see their Club climb up our{" "}
          <span className="font-semibold text-emerald-400">
            Climate Impact League Table
          </span>
        </>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-[1800px] px-6 py-24 md:px-12 xl:px-16">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white md:text-5xl">
          How Score-For-Our-Planet Works
        </h2>
        <p className="mt-5 text-lg text-slate-400 md:text-xl">
          Five simple steps that transform sporting passion into measurable climate action.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 items-stretch gap-12 sm:grid-cols-2 xl:mt-24 xl:grid-cols-5 xl:gap-x-16 xl:gap-y-12">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex flex-col items-center px-2 text-center xl:px-3"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-3xl font-black text-black shadow-xl">
              {step.number}
            </div>
            <h3 className="mt-8 text-xl font-bold text-white md:text-2xl">
              {step.title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-slate-400 md:text-[0.95rem] md:leading-8">
              {step.description}
            </p>
            {index < steps.length - 1 && (
              <div className="mt-auto hidden w-3/4 pt-10 xl:block">
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-green-500 to-green-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
