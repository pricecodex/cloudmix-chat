import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { Chat } from "@/entities/chat/chat.entity";
import { createChatDto } from "@/entities/chat/dtos/create-chat.dto";
import { authorizeSession } from "@/entities/session/services/authorize-session";
import { Session } from "@/entities/session/session.entity";
import { User } from "@/entities/user/user.entity";
import { getEvenBuffer, WsNotification } from "@/features/aws/ws-notification";
import { ONE_TO_MANY_RELATIONSHIP_LIMIT } from "@/server/shared/constants";
import { generateRandomString } from "@/server/shared/db/generate-randon-string";
import { Query } from "@/server/shared/db/query";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { sendToActive } from "@/server/shared/ws/send-to-active";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, createChatDto);
  const session = await authorizeSession(dto);
  const toUser = await Query.get(User, dto.to);
  const fromUser = (await Query.get(User, session.username))!;
  if (!toUser) {
    throw new BadRequestException("No such user exists");
  }
  if (toUser.username === session.username) {
    throw new BadRequestException("You can't create chat with yourself");
  }
  if (Object.values(fromUser.chats).length >= ONE_TO_MANY_RELATIONSHIP_LIMIT) {
    throw new BadRequestException("You've reached the maximum chats limit");
  }
  const toUserSession = await Query.get(Session, dto.to);
  const now = new Date().toISOString();
  const chatId = generateRandomString();
  await Query.create(Chat, { chatId, lastMessageDate: now, lastMessage: dto.message });
  await Query.create(ChatMessage, { chatId, createdAt: now, content: dto.message, owner: session.username });
  await Query.update(User, session.username, { chats: { ...fromUser.chats, [dto.to]: chatId } });
  await Query.update(User, dto.to, { chats: { ...toUser.chats, [session.username]: chatId } });

  await sendToActive(
    toUserSession,
    getEvenBuffer(WsNotification.Message, {
      from: session.username,
      createdAt: now,
      chatId,
    }),
  );

  return NextResponse.json({
    message: "Created user successfully",
    data: { chatId, lastMessageDate: now, lastMessage: dto.message, toUser: toUser.username },
  });
});
