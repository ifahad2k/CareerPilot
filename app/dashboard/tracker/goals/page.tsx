import { redirect } from "next/navigation";

export default function TrackerGoalsRedirectPage() {
  redirect("/dashboard/goals");
}
