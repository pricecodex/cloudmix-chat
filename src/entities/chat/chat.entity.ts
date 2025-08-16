import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const Chat: Entity<{ chatId: string; lastMessage: string }, "chatId", "lastMessage"> = {
  primaryKey: { type: ScalarAttributeType.S, name: "chatId" },
  sortKey: { type: ScalarAttributeType.S, name: "lastMessage" },
  tableName: "Chats",
};
