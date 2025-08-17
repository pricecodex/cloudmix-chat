import { Query } from "@/server/shared/db/query";
import { WsMessageDto } from "./dto";
import { User } from "@/entities/user/user.entity";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { Chat } from "@/entities/chat/chat.entity";
import { generateRandomString } from "@/server/shared/db/generate-randon-string";
import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { ws } from "@/server/shared/ws/ws";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { Session } from "@/entities/session/session.entity";
import { getEvenBuffer, WsNotification } from "../ws-notification";

export async function handleWsMessage(dto: WsMessageDto) {
  const toUser = await Query.get(User, dto.to);
  const currentUser = await Query.get(User, dto.from);

  if (!toUser || !currentUser) {
    throw new BadRequestException("No such user exists");
  }

  const now = new Date().toISOString();
  let chatId = toUser.chats[dto.from];

  const toUserSession = await Query.get(Session, dto.to);

  if (!chatId) {
    chatId = generateRandomString();
    // todo send chatid so user knows where to go
    // and also send new message to toUser
    await Query.create(Chat, { chatId, lastMessageDate: now, lastMessage: dto.content });
    await Query.create(ChatMessage, { chatId, createdAt: now, content: dto.content, owner: dto.from });
    await Query.update(User, dto.from, { chats: { ...currentUser.chats, [dto.to]: chatId } });
    await Query.update(User, dto.to, { chats: { ...toUser.chats, [dto.from]: chatId } });

    await ws.send(
      new PostToConnectionCommand({
        ConnectionId: dto.connectionId,
        Data: getEvenBuffer(WsNotification.Message, {
          from: dto.from,
          createdAt: now,
          chatId,
        }),
      }),
    );
  } else {
    await Query.create(ChatMessage, { chatId: chatId, createdAt: now, content: dto.content, owner: dto.from });
  }

  if (toUserSession && toUserSession.connectionId) {
    await ws.send(
      new PostToConnectionCommand({
        ConnectionId: toUserSession.connectionId,
        Data: getEvenBuffer(WsNotification.Message, {
          from: dto.from,
          createdAt: now,
          chatId,
        }),
      }),
    );
  }
}
