import { Chat } from "@/entities/chat/chat.entity";
import { findSessionDto } from "@/entities/session/dtos/find-session.dto";
import { authorizeSession } from "@/entities/session/services/authorize-session";
import { Session } from "@/entities/session/session.entity";
import { User } from "@/entities/user/user.entity";
import { Query } from "@/server/shared/db/query";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, findSessionDto);
  await authorizeSession(dto);
  const currentUser = (await Query.get(User, dto.username))!;
  const chats = await Promise.all(
    Object.entries(currentUser.chats).map(async ([toUser, chatId]) => {
      const [chat, toUserSession] = await Promise.all([Query.get(Chat, chatId), Query.get(Session, toUser)]);
      return {
        lastMessageDate: chat!.lastMessageDate,
        lastMessage: chat!.lastMessage,
        username: toUser,
        isOnline: !!toUserSession?.connectionId,
      };
    }),
  );

  chats.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());

  return NextResponse.json({ data: chats });
});
