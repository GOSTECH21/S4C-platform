export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sport Creates Excitement",
      description:
        "Every GOAL; Every TRY; Every TOUCHDOWN; Every 3-POINT scored during a Match creates a Climate Impact Moment",
    },
    {
      number: "02",
      title: "Climate Sponsors Step In",
      description:
        "Global brands sponsor Climate Impact Moments. Local businesses sponsor Fans/Supporters participation. Both Sponsors gain direct Fans engagement",
    },
    {
      number: "03",
      title: "Fans & Supporters Participation",
      description:
        "Fans & Supporters allocate real sponsor-funded Climate Monies into Climate Projects",
    },
    {
      number: "04",
      title: "Climate Partners Benefit",
      description:
        "Climate Partners receive sponsor-funded Climate Monies; implements project on Club's behalf; Match Day Carbon Footprint sorted",
    },
    {
      number: "05",
      title: "Everyone Wins",
      description:
        "Together we create measurable climate action while strengthening sport.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1700px] px-6 py-24 md:px-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white md:text-5xl">
          How Score-For-Our-Planet Works
        </h2>
        <p className="mt-5 text-lg text-slate-400 md:text-xl">
          Five simple steps that transform sporting passion into measurable climate action.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 items-stretch gap-12 sm:grid-cols-2 xl:mt-24 xl:grid-cols-5 xl:gap-6">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex flex-col items-center text-center"
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
              <div className="mt-auto hidden w-full pt-10 xl:block">
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-green-500 to-green-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
