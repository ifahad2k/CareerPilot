import { redirect } from "next/navigation";

// Home redirects to dashboard (middleware handles auth check)
export default function Home() {
  redirect("/dashboard");
}
