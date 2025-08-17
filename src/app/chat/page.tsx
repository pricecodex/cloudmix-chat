"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import MessageModal from "@/components/MessageModal";
import { WS_ACTION, WsEndpoint } from "@/features/aws";

type Chat = {
  id: string;
  username: string;
  lastMessage: string;
  lastMessageDate: string;
  isOnline: boolean;
  chatId: string;
};

type Message = {
  from: string;
  text: string;
  createdAt: string;
  // message: string;
};

export default function ChatsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

    wsRef.current.send(
      JSON.stringify({
        ...loginData,
        action: WS_ACTION,
        endpoint: WsEndpoint.Message,
        content: newMessage,
        to: chats.find((c) => c.id === activeChat)?.username,
      }),
    );

    // Optimistic UI update
    setMessages((prev) => [...prev, { from: "You", text: newMessage }]);
    setNewMessage("");
  };

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_AWS_API_GATEWAY_ID}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_API_STAGE}`,
    );

    ws.onopen = () => {
      console.log("Connected");
      ws.send(JSON.stringify({ action: WS_ACTION, endpoint: WsEndpoint.Connect, ...loginData }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data).body;

      console.log("Received:", msg);

      setMessages((prev) => [
        ...prev,
        {
          from: msg.owner === loginData.username ? "You" : msg.owner,
          text: msg.message,
          createdAt: msg.createdAt || new Date().toISOString(),
        },
      ]);
      console.log("messages", messages);
    };

    ws.onclose = () => console.log("Disconnected");
    ws.onerror = (err) => console.error("Error:", err);

    wsRef.current = ws;

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    (async () => {
      try {
        const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

        const res = await fetch(`/api/chats/${activeChat}`, {
          method: "POST",
          body: JSON.stringify(loginData),
        });

        const { data } = await res.json();

        const normalized = data.map((m: any) => ({
          from: m.owner === loginData.username ? "You" : m.owner,
          text: m.content,
          createdAt: m.createdAt,
        }));

        setMessages(normalized);
      } catch (err) {
        console.error("Failed to fetch messages", err);
        setMessages([]);
      }
    })();
  }, [activeChat]);

  useEffect(() => {
    (async () => {
      try {
        const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

        const res = await fetch("/api/me", {
          method: "POST",
          body: JSON.stringify({ ...loginData }),
        });

        const json = await res.json();
        console.log("Fetched chats:", json);

        const chatsArray = Array.isArray(json.data) ? json.data : [];

        const normalized = chatsArray.map((c, idx) => ({
          ...c,
          id: c.chatId,
        }));

        setChats(normalized);
      } catch (e) {
        console.error("Failed to fetch chats", e);
      }
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
              <p className="text-primary text-lg font-medium">{chat.username}</p>
              <div className="text-primary-dimmed flex justify-between">
                <p className="truncate text-sm">{chat.lastMessage}</p>
                <span className="text-xs">
                  {new Date(chat.lastMessageDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
                <h2 className="text-primary text-lg font-medium">{chats.find((c) => c.id === activeChat)?.username}</h2>
                <p className="text-primary-dimmed">
                  {chats.find((c) => c.id === activeChat)?.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              {/* Back button (mobile only) */}
              <button onClick={() => setActiveChat(null)} className="text-sm text-purple-600 md:hidden">
                ← Back
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6 md:px-10">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={clsx(
                    "max-w-xs rounded-2xl px-3 py-2",
                    msg.from === "You" ? "bg-secondary ml-auto text-white" : "bg-white",
                  )}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-divider flex gap-2 border-t bg-white px-4 py-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
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
