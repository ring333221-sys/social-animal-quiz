import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { participants } from "@/db/schema";
import { eventSnapshot, findEvent, isAnimal, routeError } from "../../lib";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const event = await findEvent(code);
    if (!event) return Response.json({ error: "找不到這個活動代碼" }, { status: 404 });
    if (event.status !== "OPEN") return Response.json({ error: "這場活動已經結束，停止接受新結果。" }, { status: 409 });
    const body = await request.json() as { participantId?: string; primaryAnimal?: string; secondaryAnimal?: string; nickname?: string };
    const participantId = body.participantId?.trim().slice(0, 80) ?? "";
    if (!participantId || !isAnimal(body.primaryAnimal) || !isAnimal(body.secondaryAnimal)) return Response.json({ error: "測驗結果格式不完整" }, { status: 400 });
    const nickname = event.allowNickname ? (body.nickname?.trim().slice(0, 24) || null) : null;
    const now = new Date().toISOString();
    const db = getDb();
    const [existing] = await db.select({ id: participants.id }).from(participants)
      .where(and(eq(participants.eventId, event.id), eq(participants.participantId, participantId))).limit(1);
    if (existing) {
      await db.update(participants).set({ primaryAnimal: body.primaryAnimal, secondaryAnimal: body.secondaryAnimal, nickname, updatedAt: now })
        .where(eq(participants.id, existing.id));
    } else {
      await db.insert(participants).values({ eventId: event.id, participantId, primaryAnimal: body.primaryAnimal, secondaryAnimal: body.secondaryAnimal, nickname, completedAt: now, updatedAt: now });
    }
    return Response.json({ updated: Boolean(existing), snapshot: await eventSnapshot(code) });
  } catch (error) { return routeError(error); }
}
