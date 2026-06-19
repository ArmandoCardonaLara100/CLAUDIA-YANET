import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";

// Role-aware bounce target used after login.
export default async function PortalPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "admin" ? "/admin" : "/patient");
}
