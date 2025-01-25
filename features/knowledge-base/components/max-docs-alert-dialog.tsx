"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

interface MaxDocsAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maxDocs: number;
}

/**
 * A ShadCN AlertDialog that warns the user they have reached max docs.
 */
export default function MaxDocsAlertDialog({
  isOpen,
  onClose,
  maxDocs,
}: MaxDocsAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Maximum Documents Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached the maximum number of documents ({maxDocs}). Please
            delete some documents to upload more.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
