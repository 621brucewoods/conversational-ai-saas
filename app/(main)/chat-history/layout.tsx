import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
