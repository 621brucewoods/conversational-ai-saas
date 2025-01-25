"use server";
import { createClient } from "@/utils/supabase/server";

export async function incrementRequestCount(userId: string) {
  const supabase = await createClient();

  const { data: usageData, error: usageError } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (usageError || !usageData) {
    await supabase.from("user_usage").insert({
      user_id: userId,
      requests_count: 1,
      docs_uploaded_count: 0,
    });
    return 1;
  }

  const newCount = usageData.requests_count + 1;

  const { error: updateError } = await supabase
    .from("user_usage")
    .update({ requests_count: newCount })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update request count", updateError);
    return usageData.requests_count;
  }

  return newCount;
}

export async function getUsageForUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { requests_count: 0, knowledge_base_docs_count: 0 };
  }
  return data;
}

export async function getUserRoleAndTier(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return;
  }
  return data;
}
