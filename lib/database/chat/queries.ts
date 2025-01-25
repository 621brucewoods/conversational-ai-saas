"use server";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Get all chats by user
export async function getChatsByUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Failed to get chats", error);
    throw new Error("Failed to get chats");
  }

  return data;
}

// Save chat by id
export async function saveChat({ id, title }: { id: string; title: string }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const userId = user.id;

  const { error } = await supabase.from("chats").insert({
    id, // Chat ID
    userId: userId, // Associate the chat with the authenticated user's ID
    chatTitle: title, // Chat title
    createdAt: new Date(), // Timestamp
  });

  if (error) {
    console.error("Failed to save chat", error);
    throw new Error("Failed to save chat");
  }

  return NextResponse.json(
    { message: "Chat saved successfully" },
    { status: 200 }
  );
}

// Get chat by id
export async function getChatById(chatId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const userId = user.id;

  // Fetch the chat and ensure it belongs to the authenticated user
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("userId", userId);

  return chat && chat.length > 0 ? chat : null;
}

// Save messages
export async function saveMessages({
  messages,
}: {
  messages: Array<
    | {
        chatId?: string;
        id: string;
        role: "assistant" | "tool";
        content: any;
        createdAt?: Date;
      }
    | {
        id: string;
        createdAt: Date;
        chatId: string;
        role?: "user" | undefined;
        content?: any;
        experimental_providerMetadata?: any;
      }
  >;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const { error } = await supabase.from("messages").insert(messages);

  if (error) {
    console.error("Failed to save messages", error);
    throw new Error("Failed to save messages");
  }

  return { message: "Messages saved successfully" };
}

// Get messages by chat id
export async function getMessagesByChatId(chatId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatId", chatId)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Failed to get messages", error);
    throw new Error("Failed to get messages");
  }

  return data;
}

export async function getDraftedReportById(draftedReportId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const userId = user.id;

  // Fetch the drafted report and ensure it belongs to the authenticated user
  const { data: draftedReport, error: reportError } = await supabase
    .from("drafted_reports")
    .select("*")
    .eq("id", draftedReportId) // Match by the drafted report ID
    .eq("userId", userId) // Ensure the report belongs to the authenticated user
    .single();

  if (reportError || !draftedReport) {
    return NextResponse.json(
      { message: "Drafted report not found or not authorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(draftedReport, { status: 200 });
}

// Delete chat by id
export async function deleteChatById(chatId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthenticated!" }, { status: 401 });
  }

  const userId = user.id;

  // First, check if the chat belongs to the user
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id, userId")
    .eq("id", chatId)
    .single();

  if (chatError || !chat || chat.userId !== userId) {
    return NextResponse.json(
      { message: "Chat not found or not authorized" },
      { status: 404 }
    );
  }

  // Delete messages associated with the chat
  const { error: messageError } = await supabase
    .from("messages")
    .delete()
    .eq("chatId", chatId);

  if (messageError) {
    console.error("Failed to delete messages", messageError);
    throw new Error("Failed to delete messages");
  }

  // Delete the chat
  const { error: chatDeleteError } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId);

  if (chatDeleteError) {
    console.error("Failed to delete chat", chatDeleteError);
    throw new Error("Failed to delete chat");
  }

  return { message: "Chat and associated messages deleted successfully" };
}
