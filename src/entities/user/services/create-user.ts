import { generateRandomString } from "@/server/shared/db/generate-randon-string";
import { Query } from "@/server/shared/db/query";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { CreateUserDto } from "../dtos/create-user.dto";
import { User } from "../user.entity";
import { hashPassword } from "./hash-user-password";
import { AI_DEFAULT_MESSAGE, AI_USERNAME } from "@/server/shared/ai/ai";
import { Chat } from "@/entities/chat/chat.entity";
import { getAiChatId } from "@/features/ai/utils";

export async function createUser(dto: CreateUserDto) {
  const previousUser = await Query.get(User, dto.username);
  const salt = generateRandomString();
  const hashedPassword = await hashPassword(dto.password, salt);
  if (previousUser || dto.username === AI_USERNAME) {
    throw new BadRequestException("User with such username already exists");
  }
  const chatId = getAiChatId(dto.username);
  const now = new Date().toISOString();
  await Query.create(Chat, { chatId, lastMessageDate: now, lastMessage: AI_DEFAULT_MESSAGE });
  await Query.create(User, {
    username: dto.username,
    salt,
    hash: hashedPassword,
    chats: { [AI_USERNAME]: chatId },
  });
}
