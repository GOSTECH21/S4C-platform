import { redirect } from "next/navigation";
import { SUPPORTER_PREDICT_PATH } from "@/app/lib/routes";

export default function PredictCanonicalRedirect() {
  redirect(SUPPORTER_PREDICT_PATH);
}
