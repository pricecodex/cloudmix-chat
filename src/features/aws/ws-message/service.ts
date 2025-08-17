import { ChatMessage } from "@/entities/chat-message/chat-message.entity";
import { Session } from "@/entities/session/session.entity";
import { User } from "@/entities/user/user.entity";
import { Query } from "@/server/shared/db/query";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { sendToActive } from "@/server/shared/ws/send-to-active";
import { getEvenBuffer, WsNotification } from "../ws-notification";
import { WsMessageDto } from "./dto";

export async function handleWsMessage(dto: WsMessageDto) {
  const toUser = await Query.get(User, dto.to);
  const currentUser = await Query.get(User, dto.from);

  if (!toUser || !currentUser) {
    throw new BadRequestException("Users must be present in DB");
  }

  const now = new Date().toISOString();
  const chatId = toUser.chats[dto.from];
  const toUserSession = await Query.get(Session, dto.to);

  if (!chatId) {
    throw new BadRequestException("There is no chat with to user");
  }

  await Query.create(ChatMessage, { chatId: chatId, createdAt: now, content: dto.content, owner: dto.from });

  await sendToActive(
    toUserSession,
    getEvenBuffer(WsNotification.Message, {
      from: dto.from,
      createdAt: now,
      chatId,
    }),
  );
}
