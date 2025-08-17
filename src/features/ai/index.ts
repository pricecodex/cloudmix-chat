import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { ai, AI_USERNAME } from "@/server/shared/ai/ai";
import { Query } from "@/server/shared/db/query";
import { getAiChatId } from "./utils";

export async function askAiQuestion(dto: { username: string; question: string }) {
  const userNow = new Date().toISOString();
  const chatId = getAiChatId(dto.username);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `
    <context>You are a fast LLM answer this question in few words as possible, don't offer any follow up's</context>
    <question>${dto.question}</question>
    `,
  });
  const botNow = new Date().toISOString();
  const content = response.text!;

  await Query.create(ChatMessage, { chatId, content, owner: dto.username, createdAt: userNow });
  await Query.create(ChatMessage, { chatId, content, owner: AI_USERNAME, createdAt: botNow });

  return content;
}
