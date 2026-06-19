"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CloudUpload,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePatientUpload,
  getUploadFileUrl,
  preparePatientUpload,
  registerPatientUpload,
} from "@/app/actions/uploads";
import { getContentFileUrl } from "@/app/actions/content";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  useRealtime,
  type RawContent,
  type RawUpload,
} from "@/hooks/use-realtime";
import { formatDate, formatLongDate } from "@/lib/format";
import type { ContentDTO, UploadDTO } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function PatientDashboard({
  userId,
  initialContent,
  initialUploads,
}: {
  userId: number;
  initialContent: ContentDTO[];
  initialUploads: UploadDTO[];
}) {
  const [content, setContent] = useState<ContentDTO[]>(initialContent);
  const [myUploads, setMyUploads] = useState<UploadDTO[]>(initialUploads);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState<UploadDTO | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // ── Realtime: material shared by the therapist ──
  useRealtime<RawContent>("content", {
    onInsert: (c) => {
      if (c.patient_id !== userId) return;
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
      setNewIds((prev) => new Set(prev).add(c.id));
      setTimeout(
        () =>
          setNewIds((prev) => {
            const s = new Set(prev);
            s.delete(c.id);
            return s;
          }),
        10000,
      );
    },
    onDelete: (o) => setContent((prev) => prev.filter((x) => x.id !== o.id)),
  });

  // ── Realtime: my own uploads (e.g. admin moderation deletes) ──
  useRealtime<RawUpload>("patient_uploads", {
    onInsert: (u) =>
      setMyUploads((prev) =>
        prev.some((x) => x.id === u.id)
          ? prev
          : [
              {
                id: u.id,
                patientId: u.patient_id,
                patientName: "",
                storagePath: u.storage_path,
                originalName: u.original_name,
                createdAt: u.created_at,
              },
              ...prev,
            ],
      ),
    onDelete: (o) => setMyUploads((prev) => prev.filter((x) => x.id !== o.id)),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await doUpload(file);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function doUpload(file: File) {
    setUploading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        toast.error("Supabase no está configurado");
        return;
      }
      const prep = await preparePatientUpload(file.name);
      if (!prep.ok) {
        toast.error(prep.error);
        return;
      }
      const up = await supabase.storage
        .from(prep.data.bucket)
        .uploadToSignedUrl(prep.data.path, prep.data.token, file);
      if (up.error) {
        toast.error("Error al subir el archivo");
        return;
      }
      const reg = await registerPatientUpload({
        storagePath: prep.data.path,
        originalName: file.name,
      });
      if (!reg.ok) {
        toast.error(reg.error);
        return;
      }
      setMyUploads((prev) =>
        prev.some((u) => u.id === reg.data.id) ? prev : [reg.data, ...prev],
      );
      toast.success("Archivo enviado correctamente");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm) return;
    const id = confirm.id;
    setConfirm(null);
    setMyUploads((prev) => prev.filter((u) => u.id !== id)); // optimistic
    const res = await deletePatientUpload(id);
    if (res.ok) toast.success("Archivo eliminado");
    else toast.error(res.error);
  }

  async function openUpload(u: UploadDTO) {
    const res = await getUploadFileUrl(u.id);
    if (res.ok) window.open(res.data, "_blank");
    else toast.error(res.error);
  }

  return (
    <div>
      {/* ── My deliverables ── */}
      <Card className="mb-8 border-[rgba(74,127,165,0.15)] bg-[linear-gradient(135deg,rgba(74,127,165,0.06),rgba(61,139,110,0.06))] shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CloudUpload className="text-secondary size-5" />
              <span className="font-semibold">Mis entregas</span>
              <Badge className="bg-secondary text-secondary-foreground">
                {myUploads.length}
              </Badge>
            </div>
            <Button
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Subir archivo
              <input
                ref={fileInput}
                type="file"
                hidden
                onChange={handleUpload}
              />
            </Button>
          </div>

          {uploading && <Progress value={null} className="mb-3" />}

          {myUploads.length === 0 ? (
            <p className="text-muted-foreground py-1 text-sm">
              Aún no has subido ningún archivo.
            </p>
          ) : (
            <div className="flex flex-col">
              {myUploads.map((u, i) => (
                <div key={u.id}>
                  {i > 0 && <Separator />}
                  <div className="hover:bg-secondary/5 flex cursor-pointer items-center gap-3 rounded-md py-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      onClick={() => openUpload(u)}
                    >
                      <Avatar className="size-9 rounded-md">
                        <AvatarFallback className="bg-secondary/12 text-secondary rounded-md">
                          <FileText className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {u.originalName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(u.createdAt)}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setConfirm(u)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Therapist material ── */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Material de Claudia</h2>
        <Badge className="bg-primary text-primary-foreground">
          {content.length}
        </Badge>
      </div>

      {content.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="text-muted-foreground py-12 text-center">
            <FileText className="mx-auto mb-3 size-12 opacity-40" />
            <p>Claudia aún no ha compartido material contigo</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {content.map((item) => (
            <ContentCard key={item.id} item={item} isNew={newIds.has(item.id)} />
          ))}
        </div>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Eliminar archivo
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            ¿Seguro que deseas eliminar{" "}
            <strong>{confirm?.originalName}</strong>? Esta acción no se puede
            deshacer.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContentCard({ item, isNew }: { item: ContentDTO; isNew: boolean }) {
  const [opening, setOpening] = useState(false);
  const Icon =
    item.type === "file" ? FileText : item.type === "video" ? Video : Link2;
  const label =
    item.type === "file" ? "Documento" : item.type === "video" ? "Video" : "Enlace";
  const tone =
    item.type === "file"
      ? "text-primary bg-primary/10"
      : item.type === "video"
        ? "text-red-400 bg-red-400/10"
        : "text-secondary bg-secondary/10";

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
    <Card
      onClick={open}
      className={`cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg ${
        isNew ? "border-primary border-2" : ""
      }`}
    >
      <CardContent className="flex items-start gap-3 p-5">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1">
            {isNew && (
              <Badge className="bg-primary text-primary-foreground h-5 gap-1 px-1.5 text-[0.7rem]">
                <Sparkles className="size-3" />
                Nuevo
              </Badge>
            )}
            <Badge variant="outline" className="h-5 px-1.5 text-[0.7rem]">
              {label}
            </Badge>
          </div>
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="text-muted-foreground text-xs">
            {formatLongDate(item.createdAt)}
          </p>
        </div>
        {opening ? (
          <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
        ) : (
          <ExternalLink className="text-muted-foreground size-4 shrink-0" />
        )}
      </CardContent>
    </Card>
  );
}
