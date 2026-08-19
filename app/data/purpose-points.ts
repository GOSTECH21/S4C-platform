export type PurposeReward = {
  id: string;
  title: string;
  points: number;
  description: string;
};

export const purposeRewards: PurposeReward[] = [

  {
    id: "pp5",
    title: "Starter Reward",
    points: 5,
    description: "Award supporters 5 Purpose Points™ for every sponsored event.",
  },

  {
    id: "pp10",
    title: "Supporter Reward",
    points: 10,
    description: "Award supporters 10 Purpose Points™ for every sponsored event.",
  },

  {
    id: "pp25",
    title: "Champion Reward",
    points: 25,
    description: "Award supporters 25 Purpose Points™ for every sponsored event.",
  },

  {
    id: "pp50",
    title: "Legend Reward",
    points: 50,
    description: "Award supporters 50 Purpose Points™ for every sponsored event.",
  },

];