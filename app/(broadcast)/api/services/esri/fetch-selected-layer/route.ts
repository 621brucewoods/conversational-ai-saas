import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const token = req.cookies.get("arcgis_access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Access token is missing" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const layerUrl = searchParams.get("layerUrl");

  if (!layerUrl) {
    return NextResponse.json(
      { error: "Layer URL is missing" },
      { status: 400 }
    );
  }

  try {
    const queryUrl = `${layerUrl}/0/query?f=pgeojson&where=1=1`;
    const response = await fetch(queryUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to import layer: ${response.statusText}`);
    }

    const layerData = await response.json();
    return NextResponse.json(layerData);
  } catch (error) {
    console.error("Error importing AGOL layer:", error);
    return NextResponse.json(
      { error: "Failed to import layer" },
      { status: 500 }
    );
  }
}
