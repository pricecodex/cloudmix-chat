import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { ai, AI_USERNAME } from "@/server/shared/ai/ai";
import { Query } from "@/server/shared/db/query";
import { getAiChatId } from "./utils";
import { Chat } from "@/entities/chat/chat.entity";
import z from "zod";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import { findSessionDto } from "@/entities/session/dtos/find-session.dto";

export const questionDto = z.object({
  question: z.string().trim().nonempty().max(MAX_LONG_VARCHAR),
});

export const aiQuestionDto = questionDto.extend(findSessionDto.shape);

export type QuestionDto = z.infer<typeof questionDto>;
export type AiQuestionDto = z.infer<typeof aiQuestionDto>;

export async function askAiQuestion(dto: AiQuestionDto) {
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

  await Query.create(ChatMessage, { chatId, content: dto.question, owner: dto.username, createdAt: userNow });
  await Query.create(ChatMessage, { chatId, content, owner: AI_USERNAME, createdAt: botNow });
  await Query.update(Chat, { primaryKey: chatId }, { lastMessage: content, lastMessageDate: botNow });

  return content;
}
