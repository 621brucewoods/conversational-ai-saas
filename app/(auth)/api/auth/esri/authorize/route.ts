import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const { ARCGIS_CLIENT_ID, ARCGIS_REDIRECT_URI } = process.env;

  const authorizationUrl = `https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id=${ARCGIS_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    ARCGIS_REDIRECT_URI!
  )}`;

  return NextResponse.redirect(authorizationUrl);
}
