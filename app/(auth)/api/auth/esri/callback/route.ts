import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import cookie from "cookie";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.ARCGIS_CLIENT_ID!);
  params.append("client_secret", process.env.ARCGIS_CLIENT_SECRET!);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.ARCGIS_REDIRECT_URI!);
  params.append("f", "json");

  const baseUrl = process.env.BASE_URL;

  try {
    const tokenResponse = await fetch(
      "https://www.arcgis.com/sharing/rest/oauth2/token",
      {
        method: "POST",
        body: params,
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const response = NextResponse.redirect(
      `${baseUrl}/services/esri/fetch-layers`
    );

    // Store the token securely in an HttpOnly, Secure cookie
    response.cookies.set("arcgis_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokenData.expires_in,
    });

    return response;
  } catch (error) {
    console.error("Error during OAuth2 callback:", error);
    return NextResponse.json(
      { error: "Failed to exchange authorization code for token" },
      { status: 500 }
    );
  }
}
