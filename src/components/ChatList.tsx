"use client";

import clsx from "clsx";
import { Chat } from "@/types/chat";
import { formatTime } from "@/utils/date";

type ChatListProps = {
  chats: Chat[];
  activeChat: string | null;
  setActiveChat: (id: string) => void;
  openModal: () => void;
};

export default function ChatList({ chats, activeChat, setActiveChat, openModal }: ChatListProps) {
  return (
    <aside className={clsx("border-divider w-full border-r bg-white md:w-1/3", activeChat && "hidden md:block")}>
      <div className="text-primary border-divider flex items-center justify-between border-b px-5 py-5.5 text-xl font-semibold">
        <span>Messages ({chats.length})</span>
        <button className="bg-secondary rounded-lg p-2 text-sm text-white hover:bg-purple-400" onClick={openModal}>
          Find user
        </button>
      </div>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => setActiveChat(chat.id)}
            className={clsx(
              "border-divider cursor-pointer border-b px-6 py-4.5 hover:bg-gray-100",
              activeChat === chat.id && "bg-gray-200",
            )}
          >
            <p className="text-primary text-lg font-medium">{chat.username}</p>
            <div className="text-primary-dimmed flex justify-between">
              <p className="truncate text-sm">{chat.lastMessage}</p>
              <span className="text-xs">{formatTime(chat.lastMessageDate)}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
