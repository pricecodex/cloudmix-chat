import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { ai, AI_USERNAME } from "@/server/shared/ai/ai";
import { Query } from "@/server/shared/db/query";
import { getAiChatId } from "./utils";

export async function askAiQuestion(dto: { username: string; question: string }) {
  return new ReadableStream({
    async start(controller) {
      const chatId = getAiChatId(dto.username);
      const now = new Date().toISOString();

      await Query.create(ChatMessage, { chatId, content: "", owner: AI_USERNAME, createdAt: now });
      try {
        const stream = await ai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: dto.question }],
          stream: true,
        });
        let currentMessage = "";
        for await (const chunk of stream) {
          const message = chunk.choices[0]?.delta?.content || "";
          currentMessage += message;
          await Query.update(ChatMessage, { primaryKey: chatId, sortKey: now }, { content: currentMessage });
          controller.enqueue(message);
        }
        controller.close();
      } catch (error) {
        console.log(error);
        controller.error(error);
      }
    },
  });
}
