import { Entity } from "@/server/shared/db/entity";
import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export const Session: Entity<
  {
    token: string;
    username: string;
    connectionId?: string | null;
  },
  "username"
> = {
  primaryKey: { type: ScalarAttributeType.S, name: "username" },
  tableName: "Sessions",
};
