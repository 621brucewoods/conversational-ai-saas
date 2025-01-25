"use server";
import { createClient } from "@/utils/supabase/server";

export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If no user or no email, return null
  if (authError || !user || !user.email) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from("user_roles")
    .select("name, role, organization, license_start, license_end")
    .eq("email", user.email)
    .single();

  if (userError || !userData) {
    return null;
  }

  // Now we know user.email is a string
  return {
    email: user.email,
    name: userData.name,
    role: userData.role,
    organization: userData.organization,
    licenseStart: userData.license_start,
    licenseEnd: userData.license_end,
  };
}
