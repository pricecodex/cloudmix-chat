import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const User: Entity<
  {
    username: string;
    hash: string;
    salt: string;
    /** { [userId]: chatId } */
    chats: Record<string, string>;
  },
  "username"
> = {
  primaryKey: { type: ScalarAttributeType.S, name: "username" },
  tableName: "Users",
};
