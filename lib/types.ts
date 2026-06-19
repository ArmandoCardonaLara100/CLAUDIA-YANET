// Shared domain types for PsiConnect.

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Role = "admin" | "patient";

export type ContentType = "file" | "link" | "video";

/* ---- Serializable DTOs passed from server components to client components.
   Dates are ISO strings (matching what Supabase Realtime delivers). ---- */

export type PatientDTO = {
  id: number;
  username: string;
  name: string;
  age: string | null;
  phone: string | null;
  createdAt: string;
  clinical: ClinicalData;
};

export type ContentDTO = {
  id: number;
  patientId: number;
  type: ContentType;
  title: string;
  url: string | null;
  storagePath: string | null;
  originalName: string | null;
  createdAt: string;
};

export type UploadDTO = {
  id: number;
  patientId: number;
  patientName: string;
  storagePath: string;
  originalName: string;
  createdAt: string;
};

export type EmergencyContact = {
  nombre: string;
  parentesco: string;
  telefono: string;
};

export type ClinicalSession = {
  fecha: string;
  nota: string;
};

/**
 * Structured clinical chart. Stored as a `jsonb` column on `clinical_records`.
 * Mirrors the EMPTY_CLINICAL shape from the original MUI app.
 */
export type ClinicalData = {
  fecha: string;
  nombreCompleto: string;
  motivoConsulta: string;
  edad: string;
  sexo: string;
  escolaridad: string;
  estadoCivil: string;
  ocupacion: string;
  telefono: string;
  domicilio: string;
  emergencia1: EmergencyContact;
  emergencia2: EmergencyContact;
  redApoyo: string;
  notas: string;
  sesiones: ClinicalSession[];
};

export const EMPTY_CONTACT: EmergencyContact = {
  nombre: "",
  parentesco: "",
  telefono: "",
};

export const EMPTY_CLINICAL: ClinicalData = {
  fecha: "",
  nombreCompleto: "",
  motivoConsulta: "",
  edad: "",
  sexo: "",
  escolaridad: "",
  estadoCivil: "",
  ocupacion: "",
  telefono: "",
  domicilio: "",
  emergencia1: { ...EMPTY_CONTACT },
  emergencia2: { ...EMPTY_CONTACT },
  redApoyo: "",
  notas: "",
  sesiones: [],
};

/**
 * Normalize whatever is stored into a complete ClinicalData object.
 * Accepts a jsonb object, a JSON string, or legacy plain text (loaded into `notas`).
 */
export function parseClinical(input: unknown): ClinicalData {
  if (!input) return { ...EMPTY_CLINICAL, sesiones: [] };

  let data: unknown = input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return { ...EMPTY_CLINICAL, sesiones: [] };
    try {
      data = JSON.parse(trimmed);
    } catch {
      // Legacy plain-text record → keep it as the clinical notes.
      return { ...EMPTY_CLINICAL, notas: input, sesiones: [] };
    }
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    // Drop obsolete legacy fields so they don't persist on re-save.
    const { fechaLugarNacimiento: _drop, ...rest } = d;
    void _drop;
    return {
      ...EMPTY_CLINICAL,
      ...rest,
      emergencia1: {
        ...EMPTY_CONTACT,
        ...(d.emergencia1 as Partial<EmergencyContact> | undefined),
      },
      emergencia2: {
        ...EMPTY_CONTACT,
        ...(d.emergencia2 as Partial<EmergencyContact> | undefined),
      },
      sesiones: Array.isArray(d.sesiones)
        ? (d.sesiones as ClinicalSession[])
        : [],
    } as ClinicalData;
  }

  return { ...EMPTY_CLINICAL, sesiones: [] };
}
