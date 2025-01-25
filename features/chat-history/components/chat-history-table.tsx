import { FC, useMemo } from "react";
import ChatHistoryRow from "./chat-history-row";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IndeterminateCheckbox } from "./indeterminate-checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ChatHistory {
  chatId: string;
  title: string;
  createdAt: string;
}

interface ChatHistoryTableProps {
  chats: ChatHistory[];
  onDeleteChat: (chatId: string) => void;
  selectedChatIds: string[];
  onToggleChatSelection: (chatId: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onDeleteSelectedClick: () => void; // triggers the multi-delete confirmation
}

const ChatHistoryTable: FC<ChatHistoryTableProps> = ({
  chats,
  onDeleteChat,
  selectedChatIds,
  onToggleChatSelection,
  onToggleSelectAll,
  onDeleteSelectedClick,
}) => {
  // Check if all chats are selected
  const allSelected = useMemo(
    () =>
      chats.length > 0 &&
      chats.every((chat) => selectedChatIds.includes(chat.chatId)),
    [chats, selectedChatIds]
  );

  // Indeterminate if some but not all are selected
  const isIndeterminate = useMemo(
    () => !allSelected && selectedChatIds.length > 0,
    [allSelected, selectedChatIds]
  );

  return (
    <ScrollArea
      className="
       h-[75vh]
        pb-2
        rounded-xl
        border
        border-stone-300
        dark:border-stone-600
      "
    >
      <Table className="mb-10">
        <TableHeader className="sticky top-0 bg-accent">
          <TableRow>
            <TableHead className="w-10 text-sm font-semibold text-secondary-foreground">
              <IndeterminateCheckbox
                checked={allSelected}
                indeterminate={isIndeterminate}
                onChange={(checked) => onToggleSelectAll(checked)}
              />
            </TableHead>

            <TableHead className="text-sm font-semibold text-secondary-foreground">
              <div className="inline-flex items-center gap-4">
                <span>Title</span>
                {selectedChatIds.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={onDeleteSelectedClick}
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedChatIds.length})
                  </Button>
                )}
              </div>
            </TableHead>

            <TableHead className="text-sm font-semibold text-secondary-foreground">
              Created At
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {chats.map((chat) => (
            <ChatHistoryRow
              key={chat.chatId}
              chat={chat}
              onDeleteChat={() => onDeleteChat(chat.chatId)}
              isSelected={selectedChatIds.includes(chat.chatId)}
              onSelectChat={(selected) =>
                onToggleChatSelection(chat.chatId, selected)
              }
            />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default ChatHistoryTable;
