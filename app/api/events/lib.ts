import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { events, participants } from "@/db/schema";

export const animalIds = ["lion", "dolphin", "dog", "owl", "fox", "cat", "elephant", "squirrel"] as const;
export type AnimalId = (typeof animalIds)[number];

export function isAnimal(value: unknown): value is AnimalId {
  return typeof value === "string" && animalIds.includes(value as AnimalId);
}

export async function findEvent(code: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.roomCode, code.toUpperCase())).limit(1);
  return event;
}

export async function eventSnapshot(code: string) {
  const db = getDb();
  const event = await findEvent(code);
  if (!event) return null;
  const grouped = await db.select({ animal: participants.primaryAnimal, count: sql<number>`count(*)` })
    .from(participants).where(eq(participants.eventId, event.id)).groupBy(participants.primaryAnimal);
  const [latest] = await db.select({ id: participants.id, animal: participants.primaryAnimal, nickname: participants.nickname, updatedAt: participants.updatedAt })
    .from(participants).where(eq(participants.eventId, event.id)).orderBy(desc(participants.updatedAt), desc(participants.id)).limit(1);
  const namedRows = event.allowNickname
    ? await db.select({ animal: participants.primaryAnimal, nickname: participants.nickname })
      .from(participants).where(eq(participants.eventId, event.id)).orderBy(desc(participants.updatedAt), desc(participants.id))
    : [];
  const counts = Object.fromEntries(animalIds.map((id) => [id, 0])) as Record<AnimalId, number>;
  const names = Object.fromEntries(animalIds.map((id) => [id, []])) as Record<AnimalId, string[]>;
  for (const row of grouped) if (isAnimal(row.animal)) counts[row.animal] = Number(row.count);
  for (const row of namedRows) if (isAnimal(row.animal) && row.nickname) names[row.animal].push(row.nickname);
  const participantCount = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    event: { id: event.id, roomCode: event.roomCode, name: event.name, eventDate: event.eventDate, estimatedCount: event.estimatedCount, allowNickname: event.allowNickname, status: event.status, createdAt: event.createdAt },
    participantCount,
    counts,
    names,
    latest: latest ?? null,
  };
}

export function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message.includes("no such table") ? "活動資料庫尚未完成初始化，請先部署資料庫 migration。" : message }, { status: 500 });
}
