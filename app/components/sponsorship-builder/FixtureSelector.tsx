type FixtureSelectorProps = {
  competition: string;
  fixture: string;
  setFixture: (fixture: string) => void;
  onContinue: () => void;
};

const fixtures: Record<string, string[]> = {
  "Premier League": [
    "Arsenal v Chelsea",
    "Liverpool v Manchester United",
    "Manchester City v Aston Villa",
    "Tottenham v Newcastle",
  ],

  Championship: [
    "Leeds United v Norwich",
    "Southampton v Sunderland",
    "Burnley v Middlesbrough",
  ],

  "FA Cup": [
    "Arsenal v Liverpool",
    "Chelsea v Aston Villa",
  ],
};

export default function FixtureSelector({
  competition,
  fixture,
  setFixture,
  onContinue,
}: FixtureSelectorProps) {
  return (
    <div className="rounded-2xl border bg-white p-10 shadow">

      <h2 className="text-3xl font-bold">
        Step 2 of 6
      </h2>

      <p className="mt-2 text-slate-500">
        Choose Fixture
      </p>

      <select
        value={fixture}
        onChange={(e) => setFixture(e.target.value)}
        className="mt-6 w-full rounded-lg border p-3"
      >
        <option value="">
          Select Fixture
        </option>

        {(fixtures[competition] || []).map((game) => (
          <option key={game} value={game}>
            {game}
          </option>
        ))}
      </select>

      <button
        disabled={!fixture}
        onClick={onContinue}
        className="mt-8 rounded-lg bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        Continue
      </button>

    </div>
  );
}