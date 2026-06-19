import { Heart } from "lucide-react";
import { requirePatient, sessionUserId } from "@/lib/dal";
import { getContentForPatient, getMyUploads } from "@/lib/queries";
import { PatientDashboard } from "@/components/patient/patient-dashboard";

export const dynamic = "force-dynamic";

export default async function PatientPage() {
  const session = await requirePatient();
  const userId = sessionUserId(session);
  const name = session.user.name ?? "";

  const [content, uploads] = await Promise.all([
    getContentForPatient(userId),
    getMyUploads(userId),
  ]);

  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-[linear-gradient(135deg,#3D8B6E_0%,#4A7FA5_100%)] px-4 py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white sm:size-14">
            {name?.[0]}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Hola, {name} 👋
            </h1>
            <p className="text-sm text-white/80">
              Gracias por confiar en mí, para acompañarte en este momento.
            </p>
            <p className="text-sm text-white/80">
              Este será uno de los medios para estar en contacto para tu proceso
              psicoterapéutico.
            </p>
          </div>
          <Heart className="ml-auto hidden size-10 text-white/40 sm:block" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <PatientDashboard
          userId={userId}
          initialContent={content}
          initialUploads={uploads}
        />
      </div>
    </div>
  );
}
