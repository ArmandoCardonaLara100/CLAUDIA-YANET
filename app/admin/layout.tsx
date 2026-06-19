import { requireAdmin } from "@/lib/dal";
import { Navbar } from "@/components/shared/navbar";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <RealtimeProvider>
      <div className="bg-background min-h-screen">
        <Navbar name={session.user.name ?? "Administrador"} role="admin" />
        <div className="pt-16">{children}</div>
      </div>
    </RealtimeProvider>
  );
}
