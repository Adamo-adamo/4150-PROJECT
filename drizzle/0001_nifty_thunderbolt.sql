CREATE TABLE `advisers` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`role` varchar(120) NOT NULL,
	`demo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advisers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `application_documents` (
	`applicationId` varchar(36) NOT NULL,
	`documentId` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `application_documents_pair_unique` UNIQUE(`applicationId`,`documentId`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`universityId` varchar(36),
	`kind` varchar(32) NOT NULL,
	`mode` varchar(24) NOT NULL,
	`organization` varchar(180) NOT NULL,
	`title` varchar(220) NOT NULL,
	`location` varchar(120),
	`deadlineAt` timestamp,
	`status` varchar(48) NOT NULL,
	`shortlisted` boolean NOT NULL DEFAULT false,
	`progress` int NOT NULL DEFAULT 0,
	`note` text,
	`fictional` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_intents` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`plan` varchar(48) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'test',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_intents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`name` varchar(220) NOT NULL,
	`type` varchar(64) NOT NULL,
	`fileSizeBytes` int,
	`storageKey` varchar(255),
	`readiness` int NOT NULL DEFAULT 0,
	`fictional` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` varchar(36) NOT NULL,
	`applicationId` varchar(36) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` varchar(36) NOT NULL,
	`applicationId` varchar(36) NOT NULL,
	`label` varchar(220) NOT NULL,
	`state` varchar(32) NOT NULL,
	`required` boolean NOT NULL DEFAULT true,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `status_records` (
	`id` varchar(36) NOT NULL,
	`applicationId` varchar(36) NOT NULL,
	`status` varchar(48) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `status_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`applicationId` varchar(36) NOT NULL,
	`label` varchar(220) NOT NULL,
	`dueAt` timestamp,
	`priority` varchar(16) NOT NULL,
	`state` varchar(24) NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `universities` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`name` varchar(180) NOT NULL,
	`location` varchar(120) NOT NULL,
	`fictional` boolean NOT NULL DEFAULT true,
	CONSTRAINT `universities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` varchar(36) NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`mode` varchar(24) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_owner_unique` UNIQUE(`ownerId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(24) NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `advisers` ADD CONSTRAINT `advisers_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_documents` ADD CONSTRAINT `application_documents_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_documents` ADD CONSTRAINT `application_documents_documentId_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_universityId_universities_id_fk` FOREIGN KEY (`universityId`) REFERENCES `universities`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_intents` ADD CONSTRAINT `billing_intents_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requirements` ADD CONSTRAINT `requirements_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_records` ADD CONSTRAINT `status_records_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_applicationId_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `universities` ADD CONSTRAINT `universities_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `advisers_workspace_idx` ON `advisers` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `applications_workspace_deadline_idx` ON `applications` (`workspaceId`,`deadlineAt`);--> statement-breakpoint
CREATE INDEX `applications_workspace_status_idx` ON `applications` (`workspaceId`,`status`);--> statement-breakpoint
CREATE INDEX `billing_intents_workspace_idx` ON `billing_intents` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `documents_workspace_created_idx` ON `documents` (`workspaceId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notes_application_idx` ON `notes` (`applicationId`);--> statement-breakpoint
CREATE INDEX `requirements_application_idx` ON `requirements` (`applicationId`);--> statement-breakpoint
CREATE INDEX `status_records_application_idx` ON `status_records` (`applicationId`,`recordedAt`);--> statement-breakpoint
CREATE INDEX `tasks_application_state_due_idx` ON `tasks` (`applicationId`,`state`,`dueAt`);--> statement-breakpoint
CREATE INDEX `universities_workspace_idx` ON `universities` (`workspaceId`);