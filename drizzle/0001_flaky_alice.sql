ALTER TABLE `events` ADD `owner_id` text;--> statement-breakpoint
ALTER TABLE `events` ADD `owner_email` text;--> statement-breakpoint
CREATE INDEX `events_owner_idx` ON `events` (`owner_id`);