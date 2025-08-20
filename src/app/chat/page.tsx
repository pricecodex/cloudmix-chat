"use client";

import { useEffect, useRef, useState } from "react";
import { WS_ACTION, WsEndpoint } from "@/features/aws";
import { Chat, Message } from "@/types/chat";

import MessageModal from "@/components/MessageModal";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";

export default function ChatsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!activeChat) return;

    const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");
    if (activeChat.startsWith("@ai-chat")) {
      async function askAI() {
        const res = await fetch("/api/chats/ai", {
          method: "POST",
          body: JSON.stringify({ ...loginData, question: newMessage }),
        });
        const { data } = await res.json();
        console.log("data", data);
      }

      askAI();
    } else {
      wsRef.current.send(
        JSON.stringify({
          ...loginData,
          action: WS_ACTION,
          endpoint: WsEndpoint.Message,
          content: newMessage,
          to: chats.find((c) => c.id === activeChat)?.username,
        }),
      );
    }
    // Optimistic UI update
    setMessages((prev) => [...prev, { from: "You", text: newMessage }]);
    setNewMessage("");
  };

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

        const normalized = chatsArray.map((c: any) => ({
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
    <div className="flex h-screen flex-col">
      <Header />
      <MessageModal isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-1">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          openModal={() => setIsOpen(true)}
        />

        <ChatWindow
          activeChat={activeChat}
          chats={chats}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          closeChat={() => setActiveChat(null)}
        />
      </div>
    </div>
  );
}
