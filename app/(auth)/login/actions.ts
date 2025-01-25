"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// Define the validation schema using Zod
const loginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string(),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Parse and validate the input data
  const formDataObject = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(formDataObject);
  if (!validation.success) {
    // Return validation errors
    return {
      error: validation.error.errors.map((err) => err.message).join(", "),
    };
  }

  const { email, password } = validation.data;

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    return { error: authError.message };
  }

  const { data: userRoles, error: roleError } = await supabase
    .from("user_roles")
    .select("name, role, organization, license_start, license_end")
    .eq("email", email)
    .single();

  if (roleError || !userRoles) {
    return { error: "User not found or error occurred." };
  }

  const { name, role, organization, license_start, license_end } = userRoles;

  const licenseStartString = license_start;
  const licenseEndString = license_end;
  const currentDate = new Date();
  const licenseStartDate = new Date(license_start);
  const licenseEndDate = new Date(license_end);

  if (currentDate < licenseStartDate || currentDate > licenseEndDate) {
    return {
      error:
        "Your license has expired or not yet started. Please contact support.",
    };
  }

  return {
    success: true,
    userEmail: email,
    userName: name,
    userRole: role,
    userOrganization: organization,
    licenseStartString,
    licenseEndString,
  };
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  (await cookies()).delete("arcgis_access_token");

  revalidatePath("/");
  redirect("/login");
}
