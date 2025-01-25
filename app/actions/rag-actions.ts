"use server";
import { createClient } from "@/utils/supabase/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { generateEmbeddings } from "@/features/knowledge-base/lib/generate-embeddings";
import { generateChunks } from "@/features/knowledge-base/lib/generate-embeddings";
import { cleanString } from "@/utils/general/general-utils";

export async function saveRagDocument(
  file: any,
  numberOfPages: number,
  folderId: string | null
) {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();
  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }

  const bucketName = "documents_bucket";
  const filePath = `${authResult.user.id}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (uploadError)
    throw new Error(`Failed to upload file: ${uploadError.message}`);

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60 * 1); // Signed URL valid for 1 hour

  if (signedUrlError)
    throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);

  const fileSignedURL = signedUrlData?.signedUrl;

  if (!fileSignedURL) {
    throw new Error("Failed to retrieve the file's signed URL.");
  }

  const { data: fileData, error: fileError } = await supabase
    .from("document_files")
    .insert({
      name: file.name,
      owner: authResult.user.id,
      number_of_pages: numberOfPages,
      file_path: fileSignedURL,
      folder_id: folderId ?? null,
    })
    .select()
    .single<DocumentFile>();

  if (fileError) throw fileError;

  const loader = new WebPDFLoader(file);
  const output = await loader.load();

  const docs = output.map((d) => ({
    ...d,
    metadata: {
      ...d.metadata,
      fileName: file.name,
      fileId: fileData.id,
      ownerId: authResult.user.id,
    },
  }));

  const splittedDocs = await generateChunks.splitDocuments(docs);

  const contents = splittedDocs.map((doc) => doc.pageContent);
  const embeddings = await generateEmbeddings.embedDocuments(contents);

  const sanitizedEmbeddingsData = splittedDocs.map((doc, index) => ({
    content: cleanString(doc.pageContent),
    metadata: doc.metadata,
    embedding: embeddings[index],
    file_id: fileData.id,
  }));

  const { error: embeddingsError } = await supabase
    .from("embeddings")
    .insert(sanitizedEmbeddingsData);

  if (embeddingsError) {
    console.error("Insert Error Details:", embeddingsError);
    throw new Error(`Failed to insert embeddings: ${embeddingsError.message}`);
  }

  return fileData;
}

export async function answerQuery(query: string) {
  const supabase = await createClient();
  const { data: authResult, error: userError } = await supabase.auth.getUser();
  if (userError || !authResult?.user) {
    throw new Error("Unauthenticated!");
  }

  const userId = authResult.user.id;

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    generateEmbeddings,
    {
      client: supabase,
      tableName: "embeddings",
      queryName: "search_documents_by_similarity",
    }
  );

  const retriever = vectorStore.asRetriever({
    k: 5,
    filter: { owner: userId },
  });

  let topMatches = await retriever._getRelevantDocuments(query);

  topMatches = topMatches.filter((match) => match.metadata.similarity > 0.4);

  const matchesByPage = topMatches.reduce((acc, doc) => {
    const pageNumber = doc.metadata.loc.pageNumber;
    const currentBest = acc[pageNumber];
    if (
      !currentBest ||
      doc.metadata.similarity > currentBest.metadata.similarity
    ) {
      acc[pageNumber] = doc;
    }
    return acc;
  }, {} as Record<number, (typeof topMatches)[number]>);

  return Object.values(matchesByPage);
}
