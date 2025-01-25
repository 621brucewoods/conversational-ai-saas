export const dynamic = "force-dynamic";

import MainChatPage from "@/features/chat/components/chat";
import "@blocknote/mantine/style.css";
import { generateUUID } from "@/features/chat/utils/general-utils";

export default async function Home() {
  const chatId = generateUUID();

  return (
    <div>
      <MainChatPage chatId={chatId} initialMessages={[]} />
    </div>
  );
}
