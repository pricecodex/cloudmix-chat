import { Query } from "@/server/shared/db/query";
import { CreateUserDto } from "../dtos/create-user.dto";
import { User } from "../user.entity";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";
import { randomBytes } from "crypto";
import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import { hashPassword } from "./hash-user-password";

export async function createUser(dto: CreateUserDto) {
  const previousUser = await Query.get(User, dto.username);
  const salt = randomBytes(Math.ceil(MAX_SHORT_VARCHAR / 2)).toString("hex");
  const hashedPassword = await hashPassword(dto.password, salt);
  if (previousUser) {
    throw new BadRequestException("User with such username already exists");
  }
  await Query.create(User, {
    username: dto.username,
    salt,
    hash: hashedPassword,
  });
}
