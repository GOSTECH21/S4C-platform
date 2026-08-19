"use client";

type TeamSelectorProps = {
  fixture: string;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  onContinue: () => void;
};

export default function TeamSelector({
  fixture,
  selectedTeam,
  setSelectedTeam,
  onContinue,
}: TeamSelectorProps) {

  const teams = fixture.split(" v ");

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        Step 3 of 6
      </h2>

      <p className="mt-2 text-slate-500">
        Choose the team whose scoring events you want to sponsor.
      </p>

      <div className="mt-8 space-y-4">

        {teams.map((team) => (

          <label
            key={team}
            className="flex cursor-pointer items-center rounded-xl border p-4 hover:bg-emerald-50"
          >

            <input
              type="radio"
              name="team"
              value={team}
              checked={selectedTeam === team}
              onChange={() => setSelectedTeam(team)}
              className="mr-4"
            />

            <div>

              <p className="font-semibold">
                {team}
              </p>

              <p className="text-sm text-slate-500">
                Sponsor goals scored by {team}
              </p>

            </div>

          </label>

        ))}

      </div>

      <div className="mt-8 flex justify-end">

        <button
          disabled={!selectedTeam}
          onClick={onContinue}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>
  );
}