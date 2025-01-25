"use client";

import { useState, useEffect } from "react";
import { fetchByDocumentName } from "@/features/knowledge-base/actions/document-actions";

export const useDocumentViewer = (documentName: string) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const signedUrl = await fetchByDocumentName(documentName);
        if (signedUrl) {
          setPdfUrl(signedUrl);
        } else {
          setError("Document not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentName]);

  return { pdfUrl, error, isLoading };
};
