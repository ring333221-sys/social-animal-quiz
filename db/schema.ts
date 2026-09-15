import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  roomCode: text("room_code").notNull(),
  name: text("name").notNull(),
  eventDate: text("event_date").notNull(),
  estimatedCount: integer("estimated_count"),
  allowNickname: integer("allow_nickname", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["OPEN", "CLOSED"] }).notNull().default("OPEN"),
  hostToken: text("host_token").notNull(),
  ownerId: text("owner_id"),
  ownerEmail: text("owner_email"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("events_room_code_unique").on(table.roomCode),
  index("events_owner_idx").on(table.ownerId),
]);

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: text("event_id").notNull().references(() => events.id),
  participantId: text("participant_id").notNull(),
  primaryAnimal: text("primary_animal").notNull(),
  secondaryAnimal: text("secondary_animal").notNull(),
  nickname: text("nickname"),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("participants_event_device_unique").on(table.eventId, table.participantId),
  index("participants_event_idx").on(table.eventId),
]);
