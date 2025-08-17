import { AI_USERNAME } from "@/server/shared/ai/ai";

export function getAiChatId(username: string) {
  return `${AI_USERNAME}+${username}`;
}
