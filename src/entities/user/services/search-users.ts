import { Query } from "@/server/shared/db/query";
import { User } from "../user.entity";

export async function searchUsers(prefix: string) {
  const users = await Query.find(User, {
    where: "begins_with(username, :prefix)",
    whereValues: { prefix: { S: prefix } },
    limit: 5,
  });
  return users.items;
}
