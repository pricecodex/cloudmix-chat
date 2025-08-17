import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { findSessionDto } from "@/entities/session/dtos/find-session.dto";
import { authorizeSession } from "@/entities/session/services/authorize-session";
import { EntitySchema, Query } from "@/server/shared/db/query";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await authorizeSession(await validateRequest(req, findSessionDto));
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
