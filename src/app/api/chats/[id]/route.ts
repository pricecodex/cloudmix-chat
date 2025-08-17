import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { EntitySchema, Query } from "@/server/shared/db/query";
import { requestHandler } from "@/server/shared/request/handler";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const chatId = (await params).id;
  const CHUNK_SIZE = 10;
  const messages: EntitySchema<typeof ChatMessage>[] = [];

  let lastEvalKey: Record<string, AttributeValue> | undefined;
  while (true) {
    const { items, lastKey } = await Query.find(ChatMessage, {
      where: "chatId = :chatId",
      whereValues: { ":chatId": { S: chatId } },
      limit: CHUNK_SIZE,
      after: lastEvalKey,
    });
    lastEvalKey = lastKey;
    messages.push(...items);
    if (items.length < CHUNK_SIZE) {
      break;
    }
  }

  return NextResponse.json({ data: messages });
});
