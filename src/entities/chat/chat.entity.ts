import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const Chat: Entity<{ chatId: string; lastMessageDate: string; lastMessage: string }, "chatId"> = {
  primaryKey: { type: ScalarAttributeType.S, name: "chatId" },
  tableName: "Chats",
};
