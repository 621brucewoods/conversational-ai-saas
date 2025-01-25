"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { deleteChatById } from "@/lib/database/chat/queries";
import { formatDbDate } from "@/utils/general/general-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import useToastMessageStore from "@/stores/use-toast-message-store";
import useSidebarButtonStores from "@/stores/use-sidebar-button-stores";
import { resetChatStores } from "@/utils/reset-chat-stores";

interface ChatHistory {
  chatId: string;
  title: string;
  createdAt: string;
}

interface ChatHistoryRowProps {
  chat: ChatHistory;
  onDeleteChat: () => void;
  isSelected: boolean;
  onSelectChat: (selected: boolean) => void;
}

const ChatHistoryRow: FC<ChatHistoryRowProps> = ({
  chat,
  onDeleteChat,
  isSelected,
  onSelectChat,
}) => {
  const router = useRouter();
  const setPageToOpen = useSidebarButtonStores((state) => state.setPageToOpen);
  const setToastMessage = useToastMessageStore(
    (state) => state.setToastMessage
  );

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);

  const onOpenChat = (id: string) => {
    resetChatStores();
    setPageToOpen(null);
    setLoading(true);
    router.push(`/chat/${id}`);
  };

  const handleDeleteClick = () => {
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteChat = async () => {
    setIsDeleting(true);
    try {
      await deleteChatById(chat.chatId);
      onDeleteChat(); // Parent callback
      setToastMessage("Chat deleted successfully", "success");
    } catch (error) {
      setToastMessage("Something went wrong during deletion!", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow
        className={`cursor-pointer bg-background hover:bg-accent transition-colors ${
          loading ? "pointer-events-none cursor-default opacity-60" : ""
        }`}
        onClick={() => {
          // Only open chat if not already loading
          if (!loading) onOpenChat(chat.chatId);
        }}
      >
        <TableCell
          className="w-10"
          // Stop propagation so clicking the checkbox doesn't open the chat
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectChat(Boolean(checked))}
          />
        </TableCell>

        {/* Title */}
        <TableCell>
          <div className="text-sm font-medium truncate text-primary flex items-center">
            {chat.title}
            {loading && <Loader2 className="ml-2 animate-spin h-4 w-4" />}
          </div>
        </TableCell>

        {/* Created At */}
        <TableCell>
          <div className="text-sm text-primary">
            {formatDbDate(chat.createdAt)}
          </div>
        </TableCell>
      </TableRow>

      {/* Confirmation modal for deletion */}
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClassName="bg-red-500 hover:bg-red-600"
        onCancel={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDeleteChat}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ChatHistoryRow;
