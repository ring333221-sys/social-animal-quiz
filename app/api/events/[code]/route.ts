import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, participants } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { eventSnapshot, findEvent, routeError } from "../lib";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const snapshot = await eventSnapshot(code);
    return snapshot ? Response.json(snapshot) : Response.json({ error: "找不到這個活動代碼" }, { status: 404 });
  } catch (error) { return routeError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const event = await findEvent(code);
    if (!event) return Response.json({ error: "找不到這個活動代碼" }, { status: 404 });
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "請先登入 ChatGPT 帳號" }, { status: 401 });
    if (event.ownerId !== user.id) return Response.json({ error: "你沒有操作這個活動的權限" }, { status: 403 });
    const body = await request.json() as { status?: string };
    if (body.status !== "CLOSED") return Response.json({ error: "不支援的活動狀態" }, { status: 400 });
    await getDb().update(events).set({ status: "CLOSED", updatedAt: new Date().toISOString() }).where(eq(events.id, event.id));
    return Response.json(await eventSnapshot(code));
  } catch (error) { return routeError(error); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const event = await findEvent(code);
    if (!event) return Response.json({ error: "找不到這個活動代碼" }, { status: 404 });
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "請先登入 ChatGPT 帳號" }, { status: 401 });
    if (event.ownerId !== user.id) return Response.json({ error: "你沒有刪除這個活動的權限" }, { status: 403 });
    const db = getDb();
    await db.batch([
      db.delete(participants).where(eq(participants.eventId, event.id)),
      db.delete(events).where(eq(events.id, event.id)),
    ]);
    return Response.json({ deleted: true, roomCode: event.roomCode });
  } catch (error) { return routeError(error); }
}
