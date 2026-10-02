export default function HowItWorks() {
  const steps: Array<{
    number: string;
    title: string;
    description: string;
  }> = [
    {
      number: "01",
      title: "CLUBS CHOOSE PROJECTS",
      description:
        "Clubs select five eligible Climate Projects for supporters to fund. The selected Projects help to mitigate the Club's Match-Day Carbon emissions",
    },
    {
      number: "02",
      title: "SPONSORS FUND THE IMPACT MOMENTS",
      description:
        "Local Businesses fund fan participation. Lead Sponsors fund the Goals-Scored & unlock additional funding through Impact Moments",
    },
    {
      number: "03",
      title: "FANS DIRECT THE FUNDING",
      description:
        "Fans allocate real Sponsor-funded money to the Climate Projects they want to support (creating a DIRECT FAN ENGAGEMENT FOR LOCAL BUSINESSES)",
    },
    {
      number: "04",
      title: "PROJECTS DELIVER THE IMPACT",
      description:
        "Climate Project Providers receive funding and deliver measurable climate action",
    },
    {
      number: "05",
      title: "EVERYONE CREATES IMPACT",
      description:
        "Clubs address Match-Day carbon footprints, Sponsors engage supporters, Fans direct funding & Climate Projects turn it into action",
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
            <h3 className="mt-8 text-xl font-bold uppercase text-white md:text-2xl">
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
