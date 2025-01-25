"use client";

import React from "react";
import { useDocumentViewer } from "@/hooks/docs-hooks/use-document-viewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  documentName: string;
  pageNumber: number;
  onClose: () => void;
}

export function DocumentViewer({
  documentName,
  pageNumber,
  onClose,
}: DocumentViewerProps) {
  const { pdfUrl, error, isLoading } = useDocumentViewer(documentName);

  // Render any error in a Dialog
  if (error) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, show the PDF in a Dialog
  return (
    <Dialog open={!!pdfUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl w-full h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {documentName} (Page {pageNumber})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* If pdfUrl is present, show an iframe with #page=pageNumber */}
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#page=${pageNumber}`}
              width="100%"
              height="100%"
            />
          )}
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
