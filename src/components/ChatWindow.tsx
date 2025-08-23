import clsx from "clsx";
import { Chat, Message } from "@/types/chat";

type ChatWindowProps = {
  activeChat: string | null;
  chats: Chat[];
  messages: Message[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  sendMessage: () => void;
  closeChat: () => void;
};

export default function ChatWindow({
  activeChat,
  chats,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  closeChat,
}: ChatWindowProps) {
  if (!activeChat) {
    return (
      <div className="hidden flex-1 items-center justify-center text-gray-400 md:flex">
        Select a chat to start messaging
      </div>
    );
  }

  const chat = chats.find((c) => c.chatId === activeChat);

  function handleSendMessage(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="bg-chat-bg flex flex-1 flex-col">
      <div className="border-divider flex items-center justify-between border-b bg-white px-10 py-2.5">
        <div>
          <h2 className="text-primary text-lg font-medium">{chat?.username}</h2>
          <p className="text-primary-dimmed">{chat?.isOnline ? "Online" : "Offline"}</p>
        </div>
        <button onClick={closeChat} className="text-sm text-purple-600 md:hidden">
          ← Back
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6 md:px-10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "max-w-xs rounded-2xl px-3 py-2",
              msg.isMine ? "bg-secondary ml-auto text-white" : "bg-white",
            )}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="border-divider flex gap-2 border-t bg-white px-4 py-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleSendMessage}
          placeholder="Write a message ..."
          className="placeholder:text-primary-dimmed flex-1 rounded-lg px-8 py-5"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="text-divider hover:text-primary rounded-lg bg-transparent px-4 py-2 text-4xl"
        >
          ➤
        </button>
      </div>
    </section>
  );
}
