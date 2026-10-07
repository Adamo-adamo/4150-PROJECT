import { boolean, index, int, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 24 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const workspaces = mysqlTable("workspaces", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  mode: varchar("mode", { length: 24 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ ownerUnique: uniqueIndex("workspaces_owner_unique").on(table.ownerId) }));

export const universities = mysqlTable("universities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 180 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  fictional: boolean("fictional").default(true).notNull(),
}, table => ({ workspaceIndex: index("universities_workspace_idx").on(table.workspaceId) }));

export const applications = mysqlTable("applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  universityId: varchar("universityId", { length: 36 }).references(() => universities.id, { onDelete: "set null" }),
  kind: varchar("kind", { length: 32 }).notNull(),
  mode: varchar("mode", { length: 24 }).notNull(),
  organization: varchar("organization", { length: 180 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  location: varchar("location", { length: 120 }),
  deadlineAt: timestamp("deadlineAt"),
  status: varchar("status", { length: 48 }).notNull(),
  shortlisted: boolean("shortlisted").default(false).notNull(),
  progress: int("progress").default(0).notNull(),
  note: text("note"),
  fictional: boolean("fictional").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ workspaceDeadline: index("applications_workspace_deadline_idx").on(table.workspaceId, table.deadlineAt), workspaceStatus: index("applications_workspace_status_idx").on(table.workspaceId, table.status) }));

export const requirements = mysqlTable("requirements", {
  id: varchar("id", { length: 36 }).primaryKey(),
  applicationId: varchar("applicationId", { length: 36 }).notNull().references(() => applications.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 220 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  required: boolean("required").default(true).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ applicationIndex: index("requirements_application_idx").on(table.applicationId) }));

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  applicationId: varchar("applicationId", { length: 36 }).notNull().references(() => applications.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 220 }).notNull(),
  dueAt: timestamp("dueAt"),
  priority: varchar("priority", { length: 16 }).notNull(),
  state: varchar("state", { length: 24 }).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ applicationStateDue: index("tasks_application_state_due_idx").on(table.applicationId, table.state, table.dueAt) }));

export const documents = mysqlTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 220 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  fileSizeBytes: int("fileSizeBytes"),
  storageKey: varchar("storageKey", { length: 255 }),
  readiness: int("readiness").default(0).notNull(),
  fictional: boolean("fictional").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ workspaceCreated: index("documents_workspace_created_idx").on(table.workspaceId, table.createdAt) }));

export const applicationDocuments = mysqlTable("application_documents", {
  applicationId: varchar("applicationId", { length: 36 }).notNull().references(() => applications.id, { onDelete: "cascade" }),
  documentId: varchar("documentId", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ pairUnique: uniqueIndex("application_documents_pair_unique").on(table.applicationId, table.documentId) }));

export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  applicationId: varchar("applicationId", { length: 36 }).notNull().references(() => applications.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ applicationIndex: index("notes_application_idx").on(table.applicationId) }));

export const advisers = mysqlTable("advisers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 120 }).notNull(),
  demo: boolean("demo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ workspaceIndex: index("advisers_workspace_idx").on(table.workspaceId) }));

export const statusRecords = mysqlTable("status_records", {
  id: varchar("id", { length: 36 }).primaryKey(),
  applicationId: varchar("applicationId", { length: 36 }).notNull().references(() => applications.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 48 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, table => ({ applicationIndex: index("status_records_application_idx").on(table.applicationId, table.recordedAt) }));

export const billingIntents = mysqlTable("billing_intents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspaceId", { length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  plan: varchar("plan", { length: 48 }).notNull(),
  status: varchar("status", { length: 32 }).default("test").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ workspaceIndex: index("billing_intents_workspace_idx").on(table.workspaceId) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Requirement = typeof requirements.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Document = typeof documents.$inferSelect;
