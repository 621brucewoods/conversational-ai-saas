"use server";
import {
  handlePdfFile,
  handleDocxFile,
  handleTextFile,
} from "@/utils/general/document-utils";
import { createClient } from "@/utils/supabase/server";
import { saveRagDocument } from "@/app/actions/rag-actions";

export async function fetchDocumentFiles(): Promise<DocumentFile[]> {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();
  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }
  const { data: documentFiles, error: documentFilesError } = await supabase
    .from("document_files")
    .select()
    .order("created_at", { ascending: false })
    .returns<DocumentFile[]>();

  if (documentFilesError) {
    throw new Error(
      `Error fetching document files: ${documentFilesError.message}`
    );
  }

  // Query the "user_roles" table to get the "name" for the authenticated user
  const { data: userRoleData, error: userRoleError } = await supabase
    .from("user_roles")
    .select("name")
    .eq("id", authResult.user.id)
    .single();

  if (userRoleError) {
    throw new Error(`Error fetching user role: ${userRoleError.message}`);
  }

  const owner = userRoleData?.name;

  if (documentFiles && documentFiles?.length > 0) {
    documentFiles.map((doc) => {
      doc.owner = owner;
    });
  }

  return documentFiles || [];
}

export async function fetchByDocumentName(
  documentName: string
): Promise<string> {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();

  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }

  const bucketName = "documents_bucket";

  const { data: documentFile, error: fetchError } = await supabase
    .from("document_files")
    .select("file_path")
    .ilike("name", `%${documentName}%`)
    .order("created_at", { ascending: false })
    .single();

  if (fetchError) {
    throw new Error(`Error fetching document: ${fetchError.message}`);
  }

  if (!documentFile) {
    throw new Error("No document found with the given name.");
  }

  const originalSignedUrl = documentFile.file_path;
  const basePathSplit = originalSignedUrl.split(`${bucketName}/`);

  if (basePathSplit.length < 2) {
    throw new Error("Failed to extract storage path from file_path.");
  }

  // Extract the storage path after bucketName/
  const pathAndToken = basePathSplit[1].split("?");
  const storagePath = decodeURIComponent(pathAndToken[0]);

  // Create a fresh signed URL
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, 60 * 60 * 1); // Valid for 1 hour

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(
      `Failed to create signed URL: ${
        signedUrlError?.message || "Unknown error"
      }`
    );
  }

  return signedUrlData.signedUrl;
}

export async function deleteDocumentFile(
  fileId: number
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();

  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }

  const bucketName = "documents_bucket";

  const { data: fileData, error: fetchError } = await supabase
    .from("document_files")
    .select("file_path")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    return {
      success: false,
      message: `Failed to retrieve file path: ${fetchError.message}`,
    };
  }

  const filePath = fileData?.file_path;

  if (!filePath) {
    return {
      success: false,
      message: "File path not found for the specified document ID.",
    };
  }

  // Extract the storage path (strip out the signed URL or base URL)
  const storagePath = decodeURIComponent(
    filePath
      .split(`${bucketName}/`)[1] // Remove bucket prefix
      .split("?")[0] // Remove query string including token
  );

  //Delete the file from the Supabase bucket
  const { error: deleteStorageError } = await supabase.storage
    .from(bucketName)
    .remove([storagePath]);

  if (deleteStorageError) {
    return {
      success: false,
      message: `Failed to delete file from storage: ${deleteStorageError.message}`,
    };
  }

  // Delete the document file by its ID
  const { error: deleteError } = await supabase
    .from("document_files")
    .delete()
    .eq("id", fileId);

  if (deleteError) {
    return {
      success: false,
      message: `Failed to delete document file: ${deleteError.message}`,
    };
  }

  return {
    success: true,
    message: `Document file with ID ${fileId} and its associated file in storage have been deleted.`,
  };
}

export async function processAndUploadDocumentFile({
  file,
  folderId,
}: ProcessDocumentFileProps) {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();
  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }

  try {
    let pageCount = "Unknown";

    switch (file.type) {
      case "application/pdf":
        pageCount = await handlePdfFile(file);
        break;
      case "text/plain":
        pageCount = await handleTextFile(file);
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        pageCount = await handleDocxFile(file);
        break;
      case "application/msword":
        pageCount = `${(file.size / 1024).toFixed(2)} KB`;
        break;
    }

    // Save the document & its embeddings to the database
    const result = await saveRagDocument(file, parseInt(pageCount), folderId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Server error processing file:", error);
    return { success: false, error: `Error processing file: ${error}` };
  }
}
