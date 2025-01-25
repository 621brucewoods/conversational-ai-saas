import ChatResponseBox from "./chat-response-box/chat-response-box";

const MainChatPage = async ({
  chatId,
  initialMessages,
}: ChatResponseBoxProps) => {
  return <ChatResponseBox chatId={chatId} initialMessages={initialMessages} />;
};

export default MainChatPage;
