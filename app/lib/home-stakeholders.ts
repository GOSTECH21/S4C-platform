import {
  CLUB_LOGIN_PATH,
  CLUB_REGISTER_PATH,
  FAN_LOGIN_PATH,
  FAN_REGISTER_PATH,
  LOCAL_SPONSOR_REGISTER_PATH,
  PARTNER_LOGIN_PATH,
  PARTNER_REGISTER_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";

export const HOME_ROLE_TABS_STAMP = "role-tabs-mobile-v1";

export type HomeStakeholder = {
  title: string;
  kicker: string;
  description: string;
  shortDescription: string;
  tabHeading: string;
  tabDescription: string;
  tabCta: string;
  register: string;
  login: string;
  registerText: string;
  loginText: string;
  loginButtonText: string;
  image: string;
  imageAlt: string;
};

export const HOME_STAKEHOLDERS: HomeStakeholder[] = [
  {
    title: "Sports Clubs",
    kicker: "Lead your club to a cleaner future.",
    description:
      "Mobilize your fans to unlock sponsored funding to deliver approved climate projects & offset your Match Day carbon footprint.",
    shortDescription:
      "Mobilize fans to unlock sponsored funding and offset your Match Day carbon footprint.",
    tabHeading: "Turn every match into a climate mission.",
    tabDescription:
      "Engage fans, unlock sponsor-funded climate projects and create new commercial opportunities.",
    tabCta: "Explore Club Partnership →",
    register: CLUB_REGISTER_PATH,
    login: CLUB_LOGIN_PATH,
    registerText: "Discover Club Benefits →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Club →",
    image: "/images/home/role-club.png",
    imageAlt: "A packed stadium under floodlights",
  },
  {
    title: "Fans",
    kicker: "Support your team. Make a difference.",
    description:
      "Follow your team, support at the stadium or remotely, take part in Predict-For Planet and direct sponsor-funded money to climate projects.",
    shortDescription:
      "Follow your team and direct sponsor-funded money to climate projects.",
    tabHeading: "Support your team. Make a difference.",
    tabDescription:
      "Follow your team and direct sponsor-funded money to climate projects.",
    tabCta: "Join as a Fan →",
    register: FAN_REGISTER_PATH,
    login: FAN_LOGIN_PATH,
    registerText: "Join as a Fan →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Fan →",
    image: "/images/home/role-fan.png",
    imageAlt: "A fan holding a scarf above a packed stand",
  },
  {
    title: "Local Businesses",
    kicker: "Support your club. Support your community.",
    description:
      "Gain local visibility, align your brand with climate action and fund projects through match-day sponsorship.",
    shortDescription:
      "Fund climate projects through match-day sponsorship.",
    tabHeading: "Support your club. Support your community.",
    tabDescription:
      "Fund climate projects through match-day sponsorship.",
    tabCta: "Become a Local Sponsor →",
    register: LOCAL_SPONSOR_REGISTER_PATH,
    login: SPONSOR_LOGIN_PATH,
    registerText: "Become a Local Sponsor →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as Local Sponsor →",
    image: "/images/home/role-local.png",
    imageAlt: "A high-street of local businesses",
  },
  {
    title: "Global Brands",
    kicker: "Turn your brand purpose into real impact.",
    description:
      "Reach passionate audiences, fund measurable climate action as a Match-Sponsor or Game-Time Sponsor, and gain recognition on S4P and project provider websites.",
    shortDescription:
      "Fund measurable climate action and reach passionate audiences.",
    tabHeading: "Turn your brand purpose into real impact.",
    tabDescription:
      "Fund measurable climate action and reach passionate audiences.",
    tabCta: "Explore Brand Sponsorship →",
    register: SPONSOR_REGISTER_PATH,
    login: SPONSOR_LOGIN_PATH,
    registerText: "Explore Brand Sponsorship →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Sponsor →",
    image: "/images/home/role-global.png",
    imageAlt: "A city billboard showing a leaf for climate purpose",
  },
  {
    title: "Philanthropists",
    kicker: "Empower fans. Amplify impact.",
    description:
      "Make a climate donation (any amount per match) and let fans direct your gift to the climate projects that helps your Team climb our Climate Impact League Table (CILT).",
    shortDescription:
      "Make a climate donation and let fans help your team climb the Climate Impact League Table.",
    tabHeading: "Empower fans. Amplify impact.",
    tabDescription:
      "Make a climate donation and let fans help your team climb the Climate Impact League Table.",
    tabCta: "Be a Philanthropic Sponsor →",
    register: SPONSOR_REGISTER_PATH,
    login: SPONSOR_LOGIN_PATH,
    registerText: "Be a Philanthropic Sponsor →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Sponsor →",
    image: "/images/home/role-philanthropist.png",
    imageAlt: "Hands holding a seedling in soil",
  },
  {
    title: "Climate Project Providers",
    kicker: "Deliver solutions. Create lasting impact.",
    description:
      "Receive funding, implement high-quality climate projects and showcase sponsor support on your website.",
    shortDescription:
      "Receive funding and deliver high-quality climate projects.",
    tabHeading: "Deliver solutions. Create lasting impact.",
    tabDescription:
      "Receive funding and deliver high-quality climate projects.",
    tabCta: "Partner with S4P →",
    register: PARTNER_REGISTER_PATH,
    login: PARTNER_LOGIN_PATH,
    registerText: "Partner with S4P →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Provider →",
    image: "/images/home/role-provider.png",
    imageAlt: "Wind turbines above a forested ridge",
  },
];
