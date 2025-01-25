export async function fetchChatHistory() {
  const response = await fetch("api/chat/chat-history");
  const chats = await response.json();
  return chats;
}
