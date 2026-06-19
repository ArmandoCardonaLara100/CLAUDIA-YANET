"use client";

import { useState } from "react";
import { ClipboardList, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtime } from "@/hooks/use-realtime";
import type { RawClinical, RawUpload, RawUser } from "@/hooks/use-realtime";
import { EMPTY_CLINICAL, parseClinical } from "@/lib/types";
import type { PatientDTO, UploadDTO } from "@/lib/types";
import { PatientsTab } from "@/components/admin/patients-tab";
import { PatientTasksTab } from "@/components/admin/patient-tasks-tab";

const byName = (a: PatientDTO, b: PatientDTO) =>
  a.name.localeCompare(b.name, "es");

export function AdminDashboard({
  initialPatients,
  initialUploads,
}: {
  initialPatients: PatientDTO[];
  initialUploads: UploadDTO[];
}) {
  const [patients, setPatients] = useState<PatientDTO[]>(initialPatients);
  const [uploads, setUploads] = useState<UploadDTO[]>(initialUploads);

  const nameOf = (patientId: number) =>
    patients.find((p) => p.id === patientId)?.name ?? "Paciente";

  // ── Realtime: patient accounts ──
  useRealtime<RawUser>("users", {
    onInsert: (u) => {
      if (u.role !== "patient") return;
      setPatients((prev) =>
        prev.some((p) => p.id === u.id)
          ? prev
          : [
              ...prev,
              {
                id: u.id,
                username: u.username,
                name: u.name,
                age: u.age,
                phone: u.phone,
                createdAt: u.created_at,
                clinical: { ...EMPTY_CLINICAL },
              },
            ].sort(byName),
      );
    },
    onUpdate: (u) =>
      setPatients((prev) =>
        prev
          .map((p) =>
            p.id === u.id
              ? { ...p, name: u.name, username: u.username, age: u.age, phone: u.phone }
              : p,
          )
          .sort(byName),
      ),
    onDelete: (o) => {
      setPatients((prev) => prev.filter((p) => p.id !== o.id));
      setUploads((prev) => prev.filter((up) => up.patientId !== o.id));
    },
  });

  // ── Realtime: clinical charts ──
  useRealtime<RawClinical>("clinical_records", {
    onInsert: (c) =>
      setPatients((prev) =>
        prev.map((p) =>
          p.id === c.patient_id ? { ...p, clinical: parseClinical(c.data) } : p,
        ),
      ),
    onUpdate: (c) =>
      setPatients((prev) =>
        prev.map((p) =>
          p.id === c.patient_id ? { ...p, clinical: parseClinical(c.data) } : p,
        ),
      ),
  });

  // ── Realtime: patient uploads ──
  useRealtime<RawUpload>("patient_uploads", {
    onInsert: (u) =>
      setUploads((prev) =>
        prev.some((x) => x.id === u.id)
          ? prev
          : [
              {
                id: u.id,
                patientId: u.patient_id,
                patientName: nameOf(u.patient_id),
                storagePath: u.storage_path,
                originalName: u.original_name,
                createdAt: u.created_at,
              },
              ...prev,
            ],
      ),
    onDelete: (o) => setUploads((prev) => prev.filter((x) => x.id !== o.id)),
  });

  return (
    <Tabs defaultValue="patients">
      <div className="sticky top-16 z-40 border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger
              value="patients"
              className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:shadow-none"
            >
              <Users className="size-4" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:shadow-none"
            >
              <ClipboardList className="size-4" />
              Tareas de pacientes
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <TabsContent value="patients">
          <PatientsTab patients={patients} setPatients={setPatients} />
        </TabsContent>
        <TabsContent value="tasks">
          <PatientTasksTab uploads={uploads} setUploads={setUploads} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
