import { requireAdmin } from "@/lib/dal";
import { getAllPatientUploads, getPatients } from "@/lib/queries";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [patients, uploads] = await Promise.all([
    getPatients(),
    getAllPatientUploads(),
  ]);
  return <AdminDashboard initialPatients={patients} initialUploads={uploads} />;
}
