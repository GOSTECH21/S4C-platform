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
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";

export type HomeStakeholder = {
  title: string;
  description: string;
  register: string;
  login: string;
  registerText: string;
  loginText: string;
  image: string;
  imageAlt: string;
};

export const HOME_STAKEHOLDERS: HomeStakeholder[] = [
  {
    title: "A Fan",
    description:
      "Help your team address their Match Day Carbon Footprints; Vote and climb up our Climate Impact Fans Table (CIFT).",
    register: FAN_REGISTER_PATH,
    login: FAN_LOGIN_PATH,
    registerText: "Register as a Fan →",
    loginText: "Already registered? Login",
    image: "/images/home/card-fan.png",
    imageAlt: "Fans in a packed stadium",
  },
  {
    title: "A Sports Club",
    description:
      "Provide Fans your Climate-Sponsorship Projects; let them help address your Match Day Carbon Footprints & push you up the Climate Impact League Table (CILT).",
    register: CLUB_REGISTER_PATH,
    login: CLUB_LOGIN_PATH,
    registerText: "Register Your Club →",
    loginText: "Already registered? Login",
    image: "/images/home/card-club.png",
    imageAlt: "A floodlit football pitch",
  },
  {
    title: "A Local Business Climate Sponsor",
    description: `Put your business in front of Fans & Supporters of your local sports club; help them address their Match Day Carbon footprints and attract new climate-conscious sports Fans. Sponsor from £${LOCAL_SPONSOR_MIN_GBP} and, when voting closes, your name is attached to the 2 Climate Projects fans did not vote for.`,
    register: LOCAL_SPONSOR_REGISTER_PATH,
    login: SPONSOR_LOGIN_PATH,
    registerText: "Register as a Local Sponsor →",
    loginText: "Already registered? Login",
    image: "/images/home/card-local.png",
    imageAlt: "A local business near a stadium",
  },
  {
    title: "A National/Global Climate Sponsor",
    description:
      "Measure your environmental impact at scale, measure your environmental and financial impact on the Climate Impact Sponsor Table (CIST).",
    register: SPONSOR_REGISTER_PATH,
    login: SPONSOR_LOGIN_PATH,
    registerText: "Register as a Sponsor →",
    loginText: "Already registered? Login",
    image: "/images/home/card-national.png",
    imageAlt: "A national climate sponsor headquarters",
  },
  {
    title: "A Climate Projects Provider",
    description:
      "Register your climate project, attract new funding, and join a global community turning sport into climate action.",
    register: PARTNER_REGISTER_PATH,
    login: PARTNER_LOGIN_PATH,
    registerText: "Register Your Project →",
    loginText: "Already registered? Login",
    image: "/images/home/card-provider.png",
    imageAlt: "Climate projects in the field",
  },
];
