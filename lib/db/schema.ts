import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { ClinicalData, ContentType } from "../types";
import { EMPTY_CLINICAL } from "../types";

export const userRole = pgEnum("user_role", ["admin", "patient"]);
export const contentType = pgEnum("content_type", ["file", "link", "video"]);

// `generatedByDefaultAsIdentity` lets the data-import script insert explicit
// ids (preserving the original db.json ids) while still auto-generating otherwise.
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt hash
  role: userRole("role").notNull(),
  name: text("name").notNull(),
  age: text("age"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clinicalRecords = pgTable("clinical_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  data: jsonb("data")
    .$type<ClinicalData>()
    .notNull()
    .default(sql`'${sql.raw(JSON.stringify(EMPTY_CLINICAL))}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const content = pgTable("content", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedBy: integer("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  type: contentType("type").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  storagePath: text("storage_path"),
  originalName: text("original_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const patientUploads = pgTable("patient_uploads", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  originalName: text("original_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// One review per patient (enforced by `.unique()`), permanent once submitted
// (no edit), gated behind admin approval before showing on the public landing page.
export const reviews = pgTable("reviews", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  // Snapshot of an anonymized display name (e.g. "Armando C.") so it stays
  // stable even if the patient's account is later renamed or removed.
  displayName: text("display_name").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  clinicalRecord: one(clinicalRecords, {
    fields: [users.id],
    references: [clinicalRecords.patientId],
  }),
  content: many(content),
  uploads: many(patientUploads),
  review: one(reviews, {
    fields: [users.id],
    references: [reviews.patientId],
  }),
}));

export const clinicalRecordsRelations = relations(
  clinicalRecords,
  ({ one }) => ({
    patient: one(users, {
      fields: [clinicalRecords.patientId],
      references: [users.id],
    }),
  }),
);

export const contentRelations = relations(content, ({ one }) => ({
  patient: one(users, {
    fields: [content.patientId],
    references: [users.id],
  }),
}));

export const patientUploadsRelations = relations(patientUploads, ({ one }) => ({
  patient: one(users, {
    fields: [patientUploads.patientId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  patient: one(users, {
    fields: [reviews.patientId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Content = typeof content.$inferSelect;
export type PatientUpload = typeof patientUploads.$inferSelect;
export type ClinicalRecord = typeof clinicalRecords.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type { ContentType };
