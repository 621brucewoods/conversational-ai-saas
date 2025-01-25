import { createClient } from "@/utils/supabase/server";
import { getChatsByUser } from "@/lib/database/chat/queries";
import { NextResponse } from "next/server";

interface Chat {
  id: string;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const chats = (await getChatsByUser(userId as string)) as Chat[];

  return NextResponse.json(chats);
}
