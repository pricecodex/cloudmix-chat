import { Query } from "@/server/shared/db/query";
import { Session } from "../session.entity";

export async function findSession(username: string) {
  return await Query.get(Session, username);
}
