import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUsageForUser, getUserRoleAndTier } from "@/lib/database/usage";
import { getPermissionSet } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const userId = authData.user.id;

  const usage = await getUsageForUser(userId);

  const userRoleRecord = await getUserRoleAndTier(userId);
  if (!userRoleRecord) {
    return NextResponse.json(
      { error: "Role or subscription not found" },
      { status: 404 }
    );
  }

  const { role, subscription_tier } = userRoleRecord;
  const { maxRequests, maxDocs, maxArea } = await getPermissionSet(
    role,
    subscription_tier
  );

  return NextResponse.json({
    requests_count: usage.requests_count,
    knowledge_base_docs_count: usage.knowledge_base_docs_count,
    maxRequests,
    maxDocs,
    maxArea,
  });
}
