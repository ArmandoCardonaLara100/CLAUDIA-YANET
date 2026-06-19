"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Pencil, Phone, Search, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPatient } from "@/app/actions/patients";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PatientDTO } from "@/lib/types";
import { PatientDialog } from "@/components/admin/patient-dialog";

const byName = (a: PatientDTO, b: PatientDTO) =>
  a.name.localeCompare(b.name, "es");

const EMPTY_FORM = { name: "", age: "", phone: "", username: "", password: "" };

export function PatientsTab({
  patients,
  setPatients,
}: {
  patients: PatientDTO[];
  setPatients: Dispatch<SetStateAction<PatientDTO[]>>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PatientDTO | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone ?? "").includes(search),
  );

  async function handleCreate() {
    setCreating(true);
    setError("");
    const res = await createPatient(form);
    setCreating(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPatients((prev) =>
      prev.some((p) => p.id === res.data.id)
        ? prev
        : [...prev, res.data].sort(byName),
    );
    setCreateOpen(false);
    setForm(EMPTY_FORM);
    toast.success("Paciente creado");
  }

  function handleSaved(updated: PatientDTO) {
    setPatients((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)).sort(byName),
    );
    setSelected(updated);
  }

  function handleDeleted(id: number) {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-full flex-1 sm:min-w-60 sm:max-w-100">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setError("");
            setCreateOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <UserPlus className="size-4" />
          Nuevo paciente
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center">
          <UserPlus className="mx-auto mb-2 size-12 opacity-40" />
          <p>
            {search
              ? "No se encontraron pacientes"
              : "No hay pacientes registrados aún"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((patient) => (
            <Card
              key={patient.id}
              onClick={() => setSelected(patient)}
              className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardContent className="flex items-center gap-3 p-5">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">
                    {patient.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{patient.name}</p>
                  <p className="text-muted-foreground text-xs">
                    @{patient.username}
                  </p>
                  {patient.phone && (
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                      <Phone className="size-3" />
                      {patient.phone}
                    </p>
                  )}
                </div>
                <Pencil className="text-primary size-4 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <PatientDialog
          key={selected.id}
          patient={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {/* Create patient */}
      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo paciente</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre completo *">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Edad">
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              />
            </Field>
            <Field label="Teléfono (para WhatsApp)" full>
              <Input
                value={form.phone}
                placeholder="+52 55 1234 5678"
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <Field label="Usuario *">
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </Field>
            <Field label="Contraseña *">
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                creating || !form.name || !form.username || !form.password
              }
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Crear paciente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
