import { requirePatient } from "@/lib/dal";
import { Navbar } from "@/components/shared/navbar";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePatient();
  return (
    <RealtimeProvider>
      <div className="bg-background min-h-screen">
        <Navbar name={session.user.name ?? "Paciente"} role="patient" />
        <div className="pt-16">{children}</div>
      </div>
    </RealtimeProvider>
  );
}
