"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePatientUpload,
  getUploadFileUrl,
} from "@/app/actions/uploads";
import { formatDateTime } from "@/lib/format";
import type { UploadDTO } from "@/lib/types";
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
import { Separator } from "@/components/ui/separator";

export function PatientTasksTab({
  uploads,
  setUploads,
}: {
  uploads: UploadDTO[];
  setUploads: Dispatch<SetStateAction<UploadDTO[]>>;
}) {
  const [confirm, setConfirm] = useState<UploadDTO | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const byPatient = uploads.reduce<Record<string, UploadDTO[]>>((acc, u) => {
    (acc[u.patientName] ??= []).push(u);
    return acc;
  }, {});
  const names = Object.keys(byPatient);

  async function handleDownload(u: UploadDTO) {
    setDownloadingId(u.id);
    const res = await getUploadFileUrl(u.id);
    setDownloadingId(null);
    if (res.ok) window.open(res.data, "_blank");
    else toast.error(res.error);
  }

  async function handleDelete() {
    if (!confirm) return;
    const id = confirm.id;
    setConfirm(null);
    setUploads((prev) => prev.filter((u) => u.id !== id)); // optimistic
    const res = await deletePatientUpload(id);
    if (!res.ok) toast.error(res.error);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Users className="text-primary size-5" />
        <h2 className="text-lg font-semibold">Archivos de pacientes</h2>
      </div>

      {names.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <Users className="mx-auto mb-3 size-12 opacity-40" />
            <p>Los pacientes aún no han subido archivos</p>
          </CardContent>
        </Card>
      ) : (
        names.map((name) => (
          <Card key={name} className="mb-4">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-secondary/15 text-secondary text-sm font-bold">
                    {name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{name}</span>
                <Badge variant="outline" className="border-secondary/40 text-secondary">
                  {byPatient[name].length} archivo
                  {byPatient[name].length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="flex flex-col">
                {byPatient[name].map((u, i) => (
                  <div key={u.id}>
                    {i > 0 && <Separator />}
                    <div className="hover:bg-secondary/5 flex items-center gap-3 rounded-md py-2">
                      <Avatar className="size-9 rounded-md">
                        <AvatarFallback className="bg-secondary/10 text-secondary rounded-md">
                          <FileText className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {u.originalName}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Clock className="size-3" />
                          {formatDateTime(u.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-secondary"
                        onClick={() => handleDownload(u)}
                        disabled={downloadingId === u.id}
                      >
                        {downloadingId === u.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
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
            </CardContent>
          </Card>
        ))
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
