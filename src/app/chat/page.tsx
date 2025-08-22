"use client";

import { WS_ACTION, WsEndpoint } from "@/features/aws";
import { Chat, Message } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";
import MessageModal from "@/components/MessageModal";

import { questionDto } from "@/features/ai";
import useMutation from "@/hooks/use-mutation";
import useSession from "@/hooks/use-session";
import { ApiRoute } from "@/types/route";

import { useMemo } from "react";

import { WsNotification } from "@/features/aws/ws-notification";
import useWs from "@/hooks/use-ws";
import { AI_USERNAME } from "@/server/shared/ai/constants";
import { toast } from "sonner";
import { truncate } from "@/utils/text";
import { TOAST_MESSAGE_LIMIT } from "@/server/shared/constants";
import z from "zod";

export default function ChatsPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const { addMessageHandler, send } = useWs();
  const { getOrFail } = useSession();
  // const {}=useMutation()

  const currentChat = useMemo(() => chats.find((chat) => chat.id === activeChatId), [activeChatId]);

  useEffect(() => {
    const removeHandler = addMessageHandler(WsNotification.Message, (body) => {
      const newChats = chats.map((chat) =>
        chat.username === body.from ? { ...chat, lastMessage: body.message } : chat,
      );
      setChats(newChats);

      if (currentChat && currentChat.username === body.from) {
        setMessages((prev) => [
          ...prev,
          {
            isMine: false,
            text: body.message,
            createdAt: body.createdAt,
          },
        ]);
      } else {
        toast.message(
          <div className="flex max-w-52 flex-col gap-1">
            <p className="text-2xl font-bold">{body.from}</p>
            <p>{truncate(body.message, TOAST_MESSAGE_LIMIT)}</p>
          </div>,
        );
      }
    });

    return () => removeHandler();
  }, []);

  const {
    mutate: sendAiMessage,
    formData,
    setFormData,
  } = useMutation<typeof questionDto, { answer: string }>({
    schema: questionDto,
    path: ApiRoute.AI,
    formData: { question: "" },
  });

  const sendUserMessage = (message: string, to: string) =>
    send(WsEndpoint.Message, { content: message, to, ...getOrFail() });

  const handleSendMessage = () => {
    const message = formData.question.trim();
    if (!currentChat || !message) {
      return;
    }

    if (currentChat.username === AI_USERNAME) {
      sendAiMessage();
    } else {
      sendUserMessage(message, currentChat.username);
    }

    setMessages((prev) => [...prev, { isMine: true, createdAt: new Date().toISOString(), text: message }]);
    setFormData({ question: "" });
  };

  useEffect(() => {
    if (!activeChatId) return;
    (async () => {
      try {
        const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

        const res = await fetch(`/api/chats/${activeChatId}`, {
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
  }, [activeChatId]);

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

  async function handleLogout() {
    const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        body: JSON.stringify({ ...loginData }),
      });

      if (!res.ok) throw new Error("Failed to log out");
      const json = await res.json();
      console.log("logged out", json);

      localStorage.removeItem("loginData");

      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header handleLogout={handleLogout} />
      <MessageModal isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-1">
        <ChatList
          chats={chats}
          activeChat={activeChatId}
          setActiveChat={setActiveChatId}
          openModal={() => setIsOpen(true)}
        />

        <ChatWindow
          activeChat={activeChatId}
          chats={chats}
          messages={messages}
          newMessage={formData.question}
          setNewMessage={(question) => setFormData({ question })}
          sendMessage={handleSendMessage}
          closeChat={() => setActiveChatId(null)}
        />
      </div>
    </div>
  );
}
