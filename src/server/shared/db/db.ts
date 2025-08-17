import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BILLING_MODE, ENTITIES, PRIMARY_KEY, SORT_KEY } from "../constants";
import { Entity } from "./entity";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
);

async function tableExists(entity: Entity) {
  try {
    await db.send(new DescribeTableCommand({ TableName: entity.tableName }));
    return true;
  } catch (err) {
    if (typeof err === "object" && err !== null && "name" in err && err.name === "ResourceNotFoundException") {
      return false;
    }
    throw err;
  }
}

async function createIfNeeded(entity: Entity) {
  if (await tableExists(entity)) {
    return;
  }

  const command = new CreateTableCommand({
    TableName: entity.tableName,
    AttributeDefinitions: [
      {
        AttributeName: entity.primaryKey.name,
        AttributeType: entity.primaryKey.type,
      },
      ...(entity.sortKey
        ? [
            {
              AttributeName: entity.sortKey.name,
              AttributeType: entity.sortKey.type,
            },
          ]
        : []),
    ],
    KeySchema: [
      { AttributeName: entity.primaryKey.name, KeyType: PRIMARY_KEY },
      ...(entity.sortKey ? ([{ AttributeName: entity.sortKey.name, KeyType: SORT_KEY }] as const) : []),
    ],
    BillingMode: BILLING_MODE,
  });

  await db.send(command);
}

export async function createTables() {
  await Promise.all(ENTITIES.map((entity) => createIfNeeded(entity)));
}
