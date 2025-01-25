import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddArcGisLayerClient from "@/components/services/esri/add-arcgis-layers";

export default async function AddArcGisLayerPage() {
  const supabase = await createClient();
  const { data: authResults, error } = await supabase.auth.getUser();

  if (error || !authResults?.user) {
    redirect("/login");
  }

  return <AddArcGisLayerClient />;
}
