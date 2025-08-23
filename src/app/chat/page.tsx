"use client";

import { WsEndpoint } from "@/features/aws";
import { Chat, Message } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";
import MessageModal from "@/components/MessageModal";

import { questionDto } from "@/features/ai/dto";
import useMutation from "@/hooks/use-mutation";
import useSession from "@/hooks/use-session";
import { ApiRoute, ClientRoute } from "@/types/route";

import { useMemo } from "react";

import { WsNotification } from "@/features/aws/ws-notification";
import useWs from "@/hooks/use-ws";
import { AI_USERNAME } from "@/server/shared/ai/constants";
import { TOAST_MESSAGE_LIMIT } from "@/server/shared/constants";
import { truncate } from "@/utils/text";
import { toast } from "sonner";
import useApi from "@/hooks/use-api";
import { EntitySchema } from "@/server/shared/db/types";
import { ChatMessage } from "@/entities/chat-message/chat-message.entity";

export default function ChatsPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const { addMessageHandler, send } = useWs();
  const { remove, getOrFail, getUsername } = useSession();

  const currentChat = useMemo(() => chats.find((chat) => chat.chatId === activeChatId), [activeChatId]);

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
  }, [chats, currentChat, setMessages, setChats]);

  const { request } = useApi();
  const {
    mutate: postAiMessage,
    formData,
    setFormData,
  } = useMutation<typeof questionDto, { answer: string }>({
    schema: questionDto,
    path: ApiRoute.AI,
    formData: { question: "" },
  });

  const sendUserMessage = (message: string, to: string) =>
    send(WsEndpoint.Message, { content: message, to, ...getOrFail() });

  const sendAiMessage = async () => {
    await postAiMessage();
    const { isValid, result } = await postAiMessage();
    if (!isValid || !result) {
      return;
    }
    setMessages((prev) => [...prev, { createdAt: new Date().toISOString(), text: result.answer, isMine: false }]);
    const newChats = chats.map((chat) =>
      chat.username === AI_USERNAME ? { ...chat, lastMessage: result.answer } : chat,
    );
    setChats(newChats);
  };

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
    const newChats = chats.map((chat) =>
      chat.username === currentChat.username ? { ...chat, lastMessage: message } : chat,
    );
    setChats(newChats);
    setFormData({ question: "" });
  };

  useEffect(() => {
    if (!activeChatId) return;
    (async () => {
      try {
        const { result } = await request<EntitySchema<typeof ChatMessage>[]>({
          path: `/api/chats/${activeChatId}`,
        });

        if (!result) {
          throw new Error("Chat messages failed to load");
        }

        const messages = result.map((message) => ({
          isMine: message.owner === getUsername(),
          text: message.content,
          createdAt: message.createdAt,
        }));

        setMessages(messages);
      } catch (err) {
        console.error("Failed to fetch messages", err);
        setMessages([]);
      }
    })();
  }, [setMessages, activeChatId]);

  useEffect(() => {
    (async () => {
      try {
        const { result } = await request<Chat[]>({ path: ApiRoute.Me });
        if (!result) {
          throw new Error("Chats failed to load");
        }
        setChats(result);
      } catch (e) {
        console.error("Failed to fetch chats", e);
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      const { result } = await request({ path: ApiRoute.Logout });
      if (!result) throw new Error("Failed to log out");

      remove();
      router.push(ClientRoute.Login);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header username={getUsername()} handleLogout={handleLogout} />
      <MessageModal isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex h-[calc(100dvh_-_90px)] flex-1">
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
