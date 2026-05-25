import { redirect } from "next/navigation";

export default function TrackerKanbanRedirectPage() {
  redirect("/dashboard/kanban");
}
