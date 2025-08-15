import { Query } from "@/server/shared/db/query";
import { CreateUserDto } from "../dtos/create-user.dto";
import { User } from "../user.entity";
import { BadRequestException } from "@/server/shared/exceptions/bad-request.exception";

export async function createUser(dto: CreateUserDto) {
  const previousUser = await Query.get(User, dto.username);
  if (previousUser) {
    throw new BadRequestException("User with such username already exists");
  }
  await Query.create(User, dto);
}
