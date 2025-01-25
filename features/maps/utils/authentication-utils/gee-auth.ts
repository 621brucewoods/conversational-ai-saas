"use server";
import ee from "@google/earthengine";
import { GoogleAuth } from "google-auth-library";
import { createClient } from "@/utils/supabase/server";

export async function geeAuthenticate(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Unauthenticated!");
  }

  const key = process.env.GCP_SERVICE_ACCOUNT_KEY;

  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      JSON.parse(key || ""),
      () =>
        ee.initialize(
          null,
          null,
          () => resolve(),
          (error: any) => reject(new Error(error))
        ),
      (error: any) => reject(new Error(error))
    );
  });
}

export const getIdentityTokenGoogle = async (targetAudience: any) => {
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || ""),
  });

  const client = await auth.getIdTokenClient(targetAudience);

  const headers = await client.getRequestHeaders();

  return headers.Authorization;
};
