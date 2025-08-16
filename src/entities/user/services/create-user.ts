import { generateRandomString } from "@/server/shared/db/generate-randon-string";
import { Query } from "@/server/shared/db/query";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { CreateUserDto } from "../dtos/create-user.dto";
import { User } from "../user.entity";
import { hashPassword } from "./hash-user-password";

export async function createUser(dto: CreateUserDto) {
  const previousUser = await Query.get(User, dto.username);
  const salt = generateRandomString();
  const hashedPassword = await hashPassword(dto.password, salt);
  if (previousUser) {
    throw new BadRequestException("User with such username already exists");
  }
  await Query.create(User, {
    username: dto.username,
    salt,
    hash: hashedPassword,
    chats: {},
  });
}
