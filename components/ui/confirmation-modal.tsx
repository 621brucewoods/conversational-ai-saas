import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => Promise<void> | void;
  confirmButtonClassName?: string;
  /** NEW: Add an isDeleting or loading prop */
  isDeleting?: boolean;
}

const ConfirmationModal = ({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel = () => {},
  onConfirm = () => {},
  confirmButtonClassName = "bg-red-500 hover:bg-red-600",
  isDeleting = false,
}: ConfirmationModalProps) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        // If user tries to close while isDeleting, ignore that attempt
        if (!open && !isDeleting) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            {cancelText}
          </AlertDialogCancel>
          {/* Replace AlertDialogAction with a normal Button */}
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(confirmButtonClassName)}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
