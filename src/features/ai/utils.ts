import { AI_USERNAME } from "@/server/shared/ai/constants";

export function getAiChatId(username: string) {
  return `${AI_USERNAME}+${username}`;
}
