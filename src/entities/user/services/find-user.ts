import { Query } from "@/server/shared/db/query";
import { FindUserDto } from "../dtos/find-user.dto";
import { User } from "../user.entity";
import { hashPassword } from "./hash-user-password";

export async function findUser(dto: FindUserDto) {
  const user = await Query.get(User, dto.username);
  if (!user) {
    return null;
  }

  const resultHash = await hashPassword(dto.password, user.salt);
  if (resultHash !== user.hash) {
    return null;
  }

  return user;
}
