CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`name` text NOT NULL,
	`event_date` text NOT NULL,
	`estimated_count` integer,
	`allow_nickname` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`host_token` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_room_code_unique` ON `events` (`room_code`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`primary_animal` text NOT NULL,
	`secondary_animal` text NOT NULL,
	`nickname` text,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_event_device_unique` ON `participants` (`event_id`,`participant_id`);--> statement-breakpoint
CREATE INDEX `participants_event_idx` ON `participants` (`event_id`);