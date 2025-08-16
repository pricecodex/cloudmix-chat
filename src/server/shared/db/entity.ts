import { ScalarAttributeType } from "@aws-sdk/client-dynamodb";

export type Entity<
  T extends object = object,
  PK extends string = string,
  SK extends string = string,
> = {
  tableName: string;
  primaryKey: { type: ScalarAttributeType; name: PK };
  sortKey?: { type: ScalarAttributeType; name: SK };
};
