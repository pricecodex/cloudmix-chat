import {
  AttributeValue,
  CreateTableCommand,
  DeleteItemCommand,
  DescribeTableCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { Entity } from "./entity";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db";
import { BILLING_MODE, PRIMARY_KEY } from "./constants";

type EntitySchema<T> =
  T extends Entity<infer Schema, infer PK>
    ? Schema & Record<PK, string>
    : never;

export class Query {
  static async get<T extends Entity>(entity: T, value: string) {
    try {
      await this.createIfNeeded(entity);
      const command = new GetCommand({
        TableName: entity.tableName,
        Key: { [entity.primaryKey.name]: value },
      });
      const { Item } = await db.send(command);
      if (!Item) {
        return null;
      }
      return Item as EntitySchema<T>;
    } catch {
      return null;
    }
  }

  static async create<T extends Entity>(entity: T, value: EntitySchema<T>) {
    await this.createIfNeeded(entity);
    await db.send(
      new PutCommand({
        TableName: entity.tableName,
        Item: value,
      }),
    );
  }

  static async remove<T extends Entity>(entity: T, primaryKey: string) {
    await this.createIfNeeded(entity);
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
    },
  ) {
    await this.createIfNeeded(entity);
    const { Items, LastEvaluatedKey } = await db.send(
      new QueryCommand({
        TableName: entity.tableName,
        KeyConditionExpression: options.where,
        ExpressionAttributeValues: options.whereValues,
        Limit: options.limit,
        ExclusiveStartKey: options.after,
      }),
    );

    return { items: Items as EntitySchema<T>[], lastKey: LastEvaluatedKey };
  }

  static async update(
    entity: Entity,
    primaryKey: string,
    value: Partial<EntitySchema<Entity>>,
  ) {
    await this.createIfNeeded(entity);
    const setExpression = Object.keys(value)
      .map((column) => `${column} = :${column}`)
      .join(", ");

    await db.send(
      new UpdateCommand({
        TableName: "Users",
        Key: { [entity.primaryKey.name]: primaryKey },
        UpdateExpression: `SET ${setExpression}`,
        ExpressionAttributeValues: value,
        ReturnValues: "NONE",
      }),
    );
  }

  private static async createIfNeeded(entity: Entity) {
    if (await this.tableExists(entity)) {
      return;
    }

    const command = new CreateTableCommand({
      TableName: entity.tableName,
      AttributeDefinitions: [
        {
          AttributeName: entity.primaryKey.name,
          AttributeType: entity.primaryKey.type,
        },
      ],
      KeySchema: [
        { AttributeName: entity.primaryKey.name, KeyType: PRIMARY_KEY },
      ],
      BillingMode: BILLING_MODE,
    });

    await db.send(command);
  }

  private static async tableExists(entity: Entity) {
    try {
      await db.send(new DescribeTableCommand({ TableName: entity.tableName }));
      return true;
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        err.name === "ResourceNotFoundException"
      ) {
        return false;
      }
      throw err;
    }
  }
}
