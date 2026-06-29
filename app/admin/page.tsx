import { requireAdmin } from "@/lib/dal";
import { getAllPatientUploads, getAllReviews, getPatients } from "@/lib/queries";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [patients, uploads, reviews] = await Promise.all([
    getPatients(),
    getAllPatientUploads(),
    getAllReviews(),
  ]);
  return (
    <AdminDashboard
      initialPatients={patients}
      initialUploads={uploads}
      initialReviews={reviews}
    />
  );
}
