import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const ChatMessage: Entity<
  { chatId: string; createdAt: string; content: string; owner: string },
  "chatId",
  "createdAt"
> = {
  primaryKey: { type: ScalarAttributeType.S, name: "chatId" },
  sortKey: { type: ScalarAttributeType.S, name: "createdAt" },
  tableName: "ChatMessages",
};
