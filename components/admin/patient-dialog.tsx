"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Link2,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  UserMinus,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePatient,
  updateClinicalRecord,
  updatePatient,
} from "@/app/actions/patients";
import {
  addLink,
  deleteContent,
  getContentFileUrl,
  listContent,
  prepareContentUpload,
  registerFileContent,
} from "@/app/actions/content";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useRealtime, type RawContent } from "@/hooks/use-realtime";
import { parseClinical } from "@/lib/types";
import type {
  ClinicalData,
  ContentDTO,
  ContentType,
  EmergencyContact,
  PatientDTO,
} from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PatientDialog({
  patient,
  onClose,
  onSaved,
  onDeleted,
}: {
  patient: PatientDTO;
  onClose: () => void;
  onSaved: (p: PatientDTO) => void;
  onDeleted: (id: number) => void;
}) {
  const [form, setForm] = useState({
    name: patient.name,
    age: patient.age ?? "",
    phone: patient.phone ?? "",
    username: patient.username,
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [clinical, setClinical] = useState<ClinicalData>(() =>
    parseClinical(patient.clinical),
  );
  const [content, setContent] = useState<ContentDTO[]>([]);
  const [uploadType, setUploadType] = useState<ContentType>("file");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingClinical, setSavingClinical] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listContent(patient.id).then((res) => {
      if (res.ok) setContent(res.data);
    });
  }, [patient.id]);

  useRealtime<RawContent>("content", {
    onInsert: (c) => {
      if (c.patient_id !== patient.id) return;
      setContent((prev) =>
        prev.some((x) => x.id === c.id)
          ? prev
          : [
              {
                id: c.id,
                patientId: c.patient_id,
                type: c.type,
                title: c.title,
                url: c.url,
                storagePath: c.storage_path,
                originalName: c.original_name,
                createdAt: c.created_at,
              },
              ...prev,
            ],
      );
    },
    onDelete: (o) => setContent((prev) => prev.filter((x) => x.id !== o.id)),
  });

  const setField = (key: keyof ClinicalData) => (value: string) =>
    setClinical((c) => ({ ...c, [key]: value }));

  const setContact =
    (key: "emergencia1" | "emergencia2", field: keyof EmergencyContact) =>
    (value: string) =>
      setClinical((c) => ({ ...c, [key]: { ...c[key], [field]: value } }));

  async function handleSaveProfile() {
    setSavingProfile(true);
    const res = await updatePatient(patient.id, form);
    setSavingProfile(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onSaved(res.data);
    setForm((f) => ({ ...f, password: "" }));
    setShowPassword(false);
    toast.success(form.password ? "Perfil y contraseña actualizados" : "Perfil actualizado");
  }

  async function handleSaveClinical() {
    setSavingClinical(true);
    const res = await updateClinicalRecord(patient.id, clinical);
    setSavingClinical(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onSaved({ ...patient, clinical });
    toast.success("Expediente guardado");
  }

  async function handleDeletePatient() {
    setDeleting(true);
    const res = await deletePatient(patient.id);
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setConfirmDelete(false);
    onDeleted(patient.id);
  }

  async function handleUpload() {
    setUploading(true);
    try {
      if (uploadType === "file") {
        if (!uploadFile) return;
        const supabase = getSupabaseBrowser();
        if (!supabase) {
          toast.error("Supabase no está configurado");
          return;
        }
        const prep = await prepareContentUpload(patient.id, uploadFile.name);
        if (!prep.ok) {
          toast.error(prep.error);
          return;
        }
        const up = await supabase.storage
          .from(prep.data.bucket)
          .uploadToSignedUrl(prep.data.path, prep.data.token, uploadFile);
        if (up.error) {
          toast.error("Error al subir el archivo");
          return;
        }
        const reg = await registerFileContent({
          patientId: patient.id,
          title: uploadTitle || uploadFile.name,
          storagePath: prep.data.path,
          originalName: uploadFile.name,
        });
        if (!reg.ok) {
          toast.error(reg.error);
          return;
        }
        setContent((prev) =>
          prev.some((c) => c.id === reg.data.id) ? prev : [reg.data, ...prev],
        );
      } else {
        const reg = await addLink({
          patientId: patient.id,
          title: uploadTitle,
          url: uploadUrl,
          type: uploadType,
        });
        if (!reg.ok) {
          toast.error(reg.error);
          return;
        }
        setContent((prev) =>
          prev.some((c) => c.id === reg.data.id) ? prev : [reg.data, ...prev],
        );
      }
      setUploadTitle("");
      setUploadUrl("");
      setUploadFile(null);
      toast.success("Contenido enviado al paciente");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteContent(id: number) {
    const res = await deleteContent(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setContent((prev) => prev.filter((c) => c.id !== id));
  }

  const sessions = clinical.sesiones;

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        >
          <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b p-4 shrink-0">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {patient.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate">{patient.name}</DialogTitle>
              <p className="text-muted-foreground text-xs">@{patient.username}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </DialogHeader>

          <Tabs defaultValue="profile" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full shrink-0 justify-start rounded-none border-b bg-transparent px-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="clinical">Expediente clínico</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {/* ---- PROFILE ---- */}
              <TabsContent value="profile" className="mt-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <LabeledInput
                    label="Nombre"
                    value={form.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <LabeledInput
                    label="Usuario"
                    value={form.username}
                    onChange={(v) => setForm((f) => ({ ...f, username: v }))}
                  />
                  <LabeledInput
                    label="Edad"
                    type="number"
                    value={form.age}
                    onChange={(v) => setForm((f) => ({ ...f, age: v }))}
                  />
                  <LabeledInput
                    label="Teléfono"
                    value={form.phone}
                    onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  />
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        autoComplete="new-password"
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password: e.target.value }))
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-muted-foreground absolute inset-y-0 right-0 flex items-center px-3"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Deja este campo vacío para mantener la contraseña actual.
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-4"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>

                <Separator className="my-5" />

                <div className="border-destructive/30 bg-destructive/5 flex flex-col items-stretch gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-destructive text-sm font-bold">
                      Eliminar paciente
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Borra de forma permanente el perfil y todos sus datos.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <UserMinus className="size-4" />
                    Eliminar paciente
                  </Button>
                </div>
              </TabsContent>

              {/* ---- CLINICAL ---- */}
              <TabsContent value="clinical" className="mt-0 space-y-5">
                <ChartSection title="Ficha de identificación">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <LabeledInput
                      label="Fecha"
                      type="date"
                      value={clinical.fecha}
                      onChange={setField("fecha")}
                    />
                    <div className="sm:col-span-2">
                      <LabeledInput
                        label="Nombre completo"
                        value={clinical.nombreCompleto}
                        onChange={setField("nombreCompleto")}
                      />
                    </div>
                  </div>
                  <LabeledTextarea
                    label="Motivo de consulta"
                    value={clinical.motivoConsulta}
                    onChange={setField("motivoConsulta")}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <LabeledInput
                      label="Edad"
                      type="number"
                      value={clinical.edad}
                      onChange={setField("edad")}
                    />
                    <div className="space-y-2">
                      <Label>Sexo</Label>
                      <Select
                        value={clinical.sexo}
                        onValueChange={(v) => setField("sexo")(v ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Femenino">Mujer</SelectItem>
                          <SelectItem value="Masculino">Hombre</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <LabeledInput
                      label="Escolaridad"
                      value={clinical.escolaridad}
                      onChange={setField("escolaridad")}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Estado civil</Label>
                      <Select
                        value={clinical.estadoCivil}
                        onValueChange={(v) => setField("estadoCivil")(v ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                          <SelectItem value="Casado/a">Casado/a</SelectItem>
                          <SelectItem value="Unión libre">Unión libre</SelectItem>
                          <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                          <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <LabeledInput
                      label="Ocupación"
                      value={clinical.ocupacion}
                      onChange={setField("ocupacion")}
                    />
                  </div>
                </ChartSection>

                <ChartSection title="Información de contacto">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <LabeledInput
                      label="Número de teléfono"
                      value={clinical.telefono}
                      onChange={setField("telefono")}
                    />
                    <div className="sm:col-span-2">
                      <LabeledInput
                        label="Domicilio"
                        value={clinical.domicilio}
                        onChange={setField("domicilio")}
                      />
                    </div>
                  </div>
                </ChartSection>

                <ChartSection title="Contactos de emergencia">
                  {(["emergencia1", "emergencia2"] as const).map((key, i) => (
                    <div key={key} className="space-y-2">
                      <p className="text-muted-foreground text-xs font-semibold">
                        Contacto {i + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <LabeledInput
                          label="Nombre"
                          value={clinical[key].nombre}
                          onChange={setContact(key, "nombre")}
                        />
                        <LabeledInput
                          label="Parentesco"
                          value={clinical[key].parentesco}
                          onChange={setContact(key, "parentesco")}
                        />
                        <LabeledInput
                          label="Número de teléfono"
                          value={clinical[key].telefono}
                          onChange={setContact(key, "telefono")}
                        />
                      </div>
                    </div>
                  ))}
                </ChartSection>

                <ChartSection title="Red de apoyo">
                  <Textarea
                    rows={3}
                    placeholder="Personas, vínculos o recursos que conforman la red de apoyo del paciente..."
                    value={clinical.redApoyo}
                    onChange={(e) => setField("redApoyo")(e.target.value)}
                  />
                </ChartSection>

                <ChartSection title="Historia clínica">
                  <Textarea
                    rows={5}
                    placeholder="Antecedentes, diagnósticos, observaciones, planes de tratamiento..."
                    value={clinical.notas}
                    onChange={(e) => setField("notas")(e.target.value)}
                  />
                </ChartSection>

                <ChartSection title="Registro de sesiones">
                  {sessions.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No hay sesiones registradas aún.
                    </p>
                  )}
                  {sessions.map((s, index) => (
                    <div
                      key={index}
                      className="border-primary/10 bg-primary/5 flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div className="bg-primary/20 text-primary mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                        <LabeledInput
                          label="Fecha"
                          type="date"
                          value={s.fecha}
                          onChange={(v) =>
                            setClinical((c) => ({
                              ...c,
                              sesiones: c.sesiones.map((x, i) =>
                                i === index ? { ...x, fecha: v } : x,
                              ),
                            }))
                          }
                        />
                        <div className="sm:col-span-2">
                          <LabeledTextarea
                            label="Nota de sesión"
                            rows={1}
                            value={s.nota}
                            onChange={(v) =>
                              setClinical((c) => ({
                                ...c,
                                sesiones: c.sesiones.map((x, i) =>
                                  i === index ? { ...x, nota: v } : x,
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-1"
                        onClick={() =>
                          setClinical((c) => ({
                            ...c,
                            sesiones: c.sesiones.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setClinical((c) => ({
                        ...c,
                        sesiones: [...c.sesiones, { fecha: "", nota: "" }],
                      }))
                    }
                  >
                    <Plus className="size-4" />
                    Agregar sesión
                  </Button>
                </ChartSection>

                <Button onClick={handleSaveClinical} disabled={savingClinical}>
                  {savingClinical ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Guardar expediente"
                  )}
                </Button>
              </TabsContent>

              {/* ---- CONTENT ---- */}
              <TabsContent value="content" className="mt-0">
                <div className="border-primary/30 bg-primary/5 mb-5 rounded-lg border border-dashed p-4">
                  <p className="text-primary mb-3 text-sm font-semibold">
                    Agregar contenido
                  </p>
                  <div className="mb-3 flex gap-2">
                    {(
                      [
                        ["file", "Archivo", Paperclip],
                        ["link", "Enlace", Link2],
                        ["video", "Video", Video],
                      ] as const
                    ).map(([t, label, Icon]) => (
                      <Badge
                        key={t}
                        onClick={() => setUploadType(t)}
                        className="cursor-pointer"
                        variant={uploadType === t ? "default" : "outline"}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Título"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="mb-3"
                  />
                  {uploadType === "file" ? (
                    <label className="inline-flex">
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          setUploadFile(e.target.files?.[0] ?? null)
                        }
                      />
                      <span className="border-input hover:bg-accent inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <Paperclip className="size-4" />
                        {uploadFile ? uploadFile.name : "Seleccionar archivo"}
                      </span>
                    </label>
                  ) : (
                    <Input
                      placeholder={
                        uploadType === "video"
                          ? "https://youtube.com/..."
                          : "https://..."
                      }
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                    />
                  )}
                  <div>
                    <Button
                      className="mt-3"
                      onClick={handleUpload}
                      disabled={
                        uploading ||
                        (uploadType === "file"
                          ? !uploadFile
                          : !uploadUrl || !uploadTitle)
                      }
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Enviar al paciente"
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-3 text-sm font-medium">
                  Contenido enviado ({content.length})
                </p>
                <div className="flex flex-col gap-2">
                  {content.length === 0 && (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      Sin contenido enviado aún
                    </p>
                  )}
                  {content.map((item) => (
                    <ContentItem
                      key={item.id}
                      item={item}
                      onDelete={() => handleDeleteContent(item.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirm delete patient */}
      <Dialog open={confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Eliminar paciente
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            ¿Seguro que deseas eliminar a <strong>{patient.name}</strong>? Se
            borrarán de forma permanente su perfil, expediente clínico, contenido
            y archivos. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChartSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-primary/15 overflow-hidden rounded-xl border">
      <div className="bg-primary/5 border-primary/10 text-primary border-b px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function ContentItem({
  item,
  onDelete,
}: {
  item: ContentDTO;
  onDelete: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const Icon =
    item.type === "file" ? FileText : item.type === "video" ? Video : Link2;
  const color =
    item.type === "file"
      ? "text-primary"
      : item.type === "video"
        ? "text-red-400"
        : "text-secondary";

  async function open() {
    if (item.url) {
      window.open(item.url, "_blank");
      return;
    }
    setOpening(true);
    const res = await getContentFileUrl(item.id);
    setOpening(false);
    if (res.ok) window.open(res.data, "_blank");
    else toast.error(res.error);
  }

  return (
    <div
      onClick={open}
      className="hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3"
    >
      <Icon className={`size-4 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-muted-foreground text-xs">
          {formatDate(item.createdAt)}
        </p>
      </div>
      {opening && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
