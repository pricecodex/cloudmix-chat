import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const User: Entity<{ username: string; password: string }> = {
  primaryKey: { type: ScalarAttributeType.S, name: "username" },
  tableName: "Users",
};
