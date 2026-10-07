import { relations } from "drizzle-orm";
import { applications, applicationDocuments, documents, requirements, tasks, users, universities, workspaces } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({ workspaces: many(workspaces) }));
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({ owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }), universities: many(universities), applications: many(applications), documents: many(documents) }));
export const universitiesRelations = relations(universities, ({ one, many }) => ({ workspace: one(workspaces, { fields: [universities.workspaceId], references: [workspaces.id] }), applications: many(applications) }));
export const applicationsRelations = relations(applications, ({ one, many }) => ({ workspace: one(workspaces, { fields: [applications.workspaceId], references: [workspaces.id] }), university: one(universities, { fields: [applications.universityId], references: [universities.id] }), requirements: many(requirements), tasks: many(tasks), links: many(applicationDocuments) }));
export const requirementsRelations = relations(requirements, ({ one }) => ({ application: one(applications, { fields: [requirements.applicationId], references: [applications.id] }) }));
export const tasksRelations = relations(tasks, ({ one }) => ({ application: one(applications, { fields: [tasks.applicationId], references: [applications.id] }) }));
export const documentsRelations = relations(documents, ({ one, many }) => ({ workspace: one(workspaces, { fields: [documents.workspaceId], references: [workspaces.id] }), links: many(applicationDocuments) }));
export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({ application: one(applications, { fields: [applicationDocuments.applicationId], references: [applications.id] }), document: one(documents, { fields: [applicationDocuments.documentId], references: [documents.id] }) }));
