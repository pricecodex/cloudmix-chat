"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import MessageModal from "@/components/MessageModal";

const chats = [
  { id: "1", name: "Aslan", lastMessage: "Hi, how is going now?", time: "10:44" },
  { id: "2", name: "Moana", lastMessage: "Yo bro I got some info for you", time: "10:21" },
  { id: "3", name: "Dragon Love", lastMessage: "Send nuds", time: "10:44" },
];

const mockMessages: Record<string, { from: string; text: string }[]> = {
  "1": [
    { from: "Aslan", text: "Yo Samurai, me and pokemon head will going to Dostyk, will u join?" },
    { from: "You", text: "Okay what exactly we're doing there?" },
    { from: "You", text: "First of all, could we have a snack at Memo's" },
    { from: "Aslan", text: "We'll have to look for a gift for Alina" },
    { from: "Aslan", text: "Ok cool" },
  ],
  "2": [{ from: "Moana", text: "Yo bro I got some info for you" }],
  "3": [{ from: "Dragon Love", text: "Send nuds" }],
};

export default function ChatsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messages = activeChat ? mockMessages[activeChat] : [];

  useEffect(() => {
    (async () => {
      const loginData = JSON.parse(localStorage.getItem("loginData") || "");

      const res = await fetch("/api/me", {
        method: "POST",
        body: JSON.stringify({ ...loginData }),
      });
      const { data } = await res.json();
      console.log("data", data);
      return data;
    })();
  }, []);

  return (
    <div className="flex h-screen">
      <MessageModal isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* LEFT: Chat List */}
      <aside className={clsx("border-divider w-full border-r bg-white md:w-1/3", activeChat && "hidden md:block")}>
        <div className="text-primary border-divider flex items-center justify-between border-b px-5 py-5.5 text-xl font-semibold">
          <span>Messages ({chats.length})</span>
          <button
            className="bg-secondary rounded-lg p-2 text-sm text-white hover:bg-purple-400"
            onClick={() => setIsOpen(true)}
          >
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
              <p className="text-primary text-lg font-medium">{chat.name}</p>
              <div className="text-primary-dimmed flex justify-between">
                <p className="truncate text-sm">{chat.lastMessage}</p>
                <span className="text-xs">{chat.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT: Chat Window */}
      <section className={clsx("bg-chat-bg flex flex-1 flex-col", activeChat ? "flex" : "hidden", "md:flex")}>
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="border-divider flex items-center justify-between border-b bg-white px-10 py-2.5">
              <div>
                <h2 className="text-primary text-lg font-medium">{chats.find((c) => c.id === activeChat)?.name}</h2>
                <p className="text-primary-dimmed">Online</p>
              </div>
              {/* Back button (mobile only) */}
              <button onClick={() => setActiveChat(null)} className="text-sm text-purple-600 md:hidden">
                ← Back
              </button>
            </div>

            {/* Messages */}
            <div className="md: flex-1 space-y-6 overflow-y-auto p-6 md:pr-6 md:pl-10">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={clsx(
                    "max-w-xs rounded-2xl px-3 py-2",
                    msg.from === "You" ? "bg-secondary ml-auto text-white" : "bg-white",
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-divider flex gap-2 border-t bg-white px-4 py-2">
              <input
                type="text"
                placeholder="Write a message ..."
                className="placeholder:text-primary-dimmed flex-1 rounded-lg px-8 py-5"
              />
              <button className="text-divider rounded-lg bg-transparent px-4 py-2 text-4xl">➤</button>
            </div>
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-gray-400 md:flex">
            Select a chat to start messaging
          </div>
        )}
      </section>
    </div>
  );
}
