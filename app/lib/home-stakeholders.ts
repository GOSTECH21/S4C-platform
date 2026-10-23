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

export type HomeStakeholder = {
  title: string;
  kicker: string;
  description: string;
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
      "Measure match-day emissions, engage your fans, unlock sponsor funding and deliver verified climate projects.",
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
      "Follow your team, plan your travel (or support remotely), take part in predictions and direct sponsor-funded money to climate projects.",
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
      "Reach passionate audiences, fund measurable climate action and gain recognition on S4P and project provider websites.",
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
      "Make a transformational contribution (e.g. £10,000 per match) and let fans direct your gift to the climate projects that matter most.",
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
    register: PARTNER_REGISTER_PATH,
    login: PARTNER_LOGIN_PATH,
    registerText: "Partner with S4P →",
    loginText: "Already registered? Login",
    loginButtonText: "Login as a Provider →",
    image: "/images/home/role-provider.png",
    imageAlt: "Wind turbines above a forested ridge",
  },
];
