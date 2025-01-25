"use client";

import { useCallback } from "react";
import { processAndUploadDocumentFile } from "@/features/knowledge-base/actions/document-actions";

export type FileUploadHookProps = {
  currentFolder: { id: string } | null;
};

export const useDocumentUpload = ({ currentFolder }: FileUploadHookProps) => {
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      try {
        await Promise.all(
          Array.from(files).map(async (file) => {
            const result = await processAndUploadDocumentFile({
              file,
              // folderId: currentFolder?.id || null,
              folderId:
                currentFolder?.id === "all-documents"
                  ? null
                  : currentFolder?.id || null,
            });

            if (!result.success) {
              throw new Error(result.error);
            }
          })
        );
      } catch (error) {
        throw new Error(`Error processing files: ${error}`);
      }
    },
    [currentFolder]
  );

  return { handleFileUpload };
};
