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
    Object.entries(currentUser.chats).map(async ([toUser, chatId]) => ({
      chat: (await Query.get(Chat, chatId))!,
      isOnline: !!(await Query.get(Session, toUser))?.connectionId,
      username: toUser,
    })),
  );

  chats.sort((a, b) => new Date(b.chat.lastMessageDate).getTime() - new Date(a.chat.lastMessageDate).getTime());

  return NextResponse.json({ data: chats });
});
