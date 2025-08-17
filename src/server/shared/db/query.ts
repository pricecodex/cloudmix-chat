import { AttributeValue, DeleteItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db";
import { Entity } from "./entity";

export type EntitySchema<T> = T extends Entity<infer Schema> ? Schema : never;

export type WhenSK<T, SKCase, DefaultCase> =
  T extends Entity<infer Schema, infer PK, infer SK> ? (string extends SK ? DefaultCase : SKCase) : never;

export class Query {
  static async get<T extends Entity>(entity: T, value: string) {
    const command = new GetCommand({
      TableName: entity.tableName,
      Key: { [entity.primaryKey.name]: value },
    });
    const { Item } = await db.send(command);
    if (!Item) {
      return null;
    }
    return Item as EntitySchema<T>;
  }

  static async create<T extends Entity>(entity: T, value: EntitySchema<T>) {
    await db.send(
      new PutCommand({
        TableName: entity.tableName,
        Item: value,
      }),
    );
  }

  static async remove<T extends Entity>(entity: T, primaryKey: string) {
    await db.send(
      new DeleteItemCommand({
        TableName: entity.tableName,
        Key: { [entity.primaryKey.name]: { S: primaryKey } },
      }),
    );
  }

  static async find<T extends Entity>(
    entity: T,
    options: {
      where?: string;
      whereValues?: Record<string, AttributeValue>;
      limit?: number;
      after?: Record<string, AttributeValue>;
      select?: string;
    },
  ) {
    const { Items, LastEvaluatedKey } = await db.send(
      new QueryCommand({
        TableName: entity.tableName,
        KeyConditionExpression: options.where,
        ExpressionAttributeValues: options.whereValues,
        Limit: options.limit,
        ExclusiveStartKey: options.after,
        ProjectionExpression: options.select,
      }),
    );

    return { items: Items as EntitySchema<T>[], lastKey: LastEvaluatedKey };
  }

  static async update<T extends Entity>(
    entity: T,
    keys: WhenSK<T, { primaryKey: string; sortKey: string }, { primaryKey: string }>,
    value: Partial<EntitySchema<T>>,
  ) {
    const setExpression = Object.keys(value)
      .map((column) => `${column} = :${column}`)
      .join(", ");
    const setValues = Object.fromEntries(Object.entries(value).map(([key, value]) => [`:${key}`, value]));
    const key = { [entity.primaryKey.name]: keys.primaryKey };
    if ("sortKey" in keys && "sortKey" in entity) {
      key[entity.sortKey!.name] = keys.sortKey as string;
    }

    await db.send(
      new UpdateCommand({
        TableName: entity.tableName,
        Key: key,
        UpdateExpression: `SET ${setExpression}`,
        ExpressionAttributeValues: setValues,
        ReturnValues: "NONE",
      }),
    );
  }
}
