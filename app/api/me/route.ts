import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  return user ? Response.json({ user }) : Response.json({ user: null }, { status: 401 });
}
