export type SponsorshipProduct = {
  id: string;
  name: string;
  acronym: string;
  sport: string;
  trigger: string;
  description: string;
  icon: string;
};

export const sponsorshipProducts: SponsorshipProduct[] = [
  {
    id: "gss",
    name: "Goals-Scored Sponsorship",
    acronym: "GSS",
    sport: "Football",
    trigger: "Goal",
    description:
      "Reward supporters every time your chosen team scores a goal.",
    icon: "⚽",
  },

  {
    id: "tss",
    name: "Tries-Scored Sponsorship",
    acronym: "TSS",
    sport: "Rugby",
    trigger: "Try",
    description:
      "Reward supporters every time your chosen team scores a try.",
    icon: "🏉",
  },

  {
    id: "tdss",
    name: "Touchdown-Scored Sponsorship",
    acronym: "TDSS",
    sport: "NFL",
    trigger: "Touchdown",
    description:
      "Reward supporters every touchdown scored.",
    icon: "🏈",
  },

  {
    id: "tpss",
    name: "Three-Point Sponsorship",
    acronym: "TPSS",
    sport: "Basketball",
    trigger: "3-Point Score",
    description:
      "Reward supporters every successful three-point score.",
    icon: "🏀",
  },

  {
    id: "hgs",
    name: "Goal Sponsorship",
    acronym: "HGS",
    sport: "Hockey",
    trigger: "Goal",
    description:
      "Reward supporters every goal scored.",
    icon: "🏒",
  },

  {
    id: "bss",
    name: "Birdie Sponsorship",
    acronym: "BSS",
    sport: "Golf",
    trigger: "Birdie",
    description:
      "Reward supporters every birdie.",
    icon: "⛳",
  },

  {
    id: "ess",
    name: "Eagle Sponsorship",
    acronym: "ESS",
    sport: "Golf",
    trigger: "Eagle",
    description:
      "Reward supporters every eagle scored.",
    icon: "🏆",
  },
];