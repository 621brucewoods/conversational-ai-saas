import MainChatPage from "@/features/chat/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/database/chat/queries";
import { notFound } from "next/navigation";

import { convertToUIMessages } from "@/features/chat/utils/general-utils";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById(id);

  if (!chat) {
    notFound();
  }

  const initialMessages = await getMessagesByChatId(id);

  return (
    <MainChatPage
      chatId={id}
      initialMessages={convertToUIMessages(initialMessages as any)}
    />
  );
}
