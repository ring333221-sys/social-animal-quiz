import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { routeError } from "./lib";

function prefixFor(name: string) {
  const latin = (name.toUpperCase().match(/[A-Z0-9]/g) ?? []).join("").slice(0, 4);
  return latin.length >= 3 ? latin : "ANIMAL";
}

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "請先登入 ChatGPT 帳號" }, { status: 401 });
    const rows = await getDb().select({ roomCode: events.roomCode, name: events.name, eventDate: events.eventDate, status: events.status, createdAt: events.createdAt })
      .from(events).where(eq(events.ownerId, user.id)).orderBy(desc(events.createdAt));
    return Response.json({ user, events: rows });
  } catch (error) { return routeError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "請先登入 ChatGPT 帳號" }, { status: 401 });
    const body = await request.json() as { name?: string; eventDate?: string; estimatedCount?: number | null; allowNickname?: boolean };
    const name = body.name?.trim().slice(0, 80) ?? "";
    if (!name) return Response.json({ error: "請輸入活動名稱" }, { status: 400 });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.eventDate ?? "") ? body.eventDate! : new Date().toISOString().slice(0, 10);
    const db = getDb();
    let roomCode = "";
    for (let i = 0; i < 12; i++) {
      const suffix = String(Math.floor(10 + Math.random() * 90));
      roomCode = `${prefixFor(name)}${suffix}`.slice(0, 8);
      const [exists] = await db.select({ id: events.id }).from(events).where(eq(events.roomCode, roomCode)).limit(1);
      if (!exists) break;
    }
    const event = {
      id: crypto.randomUUID(), roomCode, name, eventDate: date,
      estimatedCount: Number.isFinite(body.estimatedCount) ? Math.max(1, Math.min(9999, Number(body.estimatedCount))) : null,
      allowNickname: Boolean(body.allowNickname), hostToken: crypto.randomUUID(), ownerId: user.id, ownerEmail: user.email,
    };
    await db.insert(events).values(event);
    return Response.json({ event: { ...event, status: "OPEN" } }, { status: 201 });
  } catch (error) { return routeError(error); }
}
