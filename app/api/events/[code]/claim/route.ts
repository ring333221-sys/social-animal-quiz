import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { findEvent, routeError } from "../../lib";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "請先登入 ChatGPT 帳號" }, { status: 401 });
    const { code } = await params;
    const event = await findEvent(code);
    if (!event) return Response.json({ error: "找不到活動" }, { status: 404 });
    if (event.ownerId && event.ownerId !== user.id) return Response.json({ error: "這個活動已屬於其他主持人" }, { status: 403 });
    if (!event.ownerId && request.headers.get("x-host-token") !== event.hostToken) return Response.json({ error: "無法驗證舊活動" }, { status: 403 });
    await getDb().update(events).set({ ownerId: user.id, ownerEmail: user.email, updatedAt: new Date().toISOString() }).where(eq(events.id, event.id));
    return Response.json({ claimed: true });
  } catch (error) { return routeError(error); }
}
