import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const Session: Entity<{
  token: string;
  userKey: string;
  status: "active";
}> = {
  primaryKey: { type: ScalarAttributeType.S, name: "token" },
  tableName: "Sessions",
};
