import { Query } from "@/server/shared/db/query";
import { InitSessionDto } from "../dtos/init-session.dto";
import { Session } from "../session.entity";
import { randomBytes } from "crypto";
import { MAX_SHORT_VARCHAR } from "@/server/shared/db/constants";

export async function initSession(dto: InitSessionDto) {
  const { items } = await Query.find(Session, {
    limit: 1,
    where: "userKey = :username",
    whereValues: { ":username": { S: dto.username } },
  });
  const [prevSession = null] = items;

  if (prevSession) {
    await Query.remove(Session, prevSession.token);
  }
  const token = randomBytes(MAX_SHORT_VARCHAR).toString("hex");
  const newSession = {
    token,
    status: "active",
    userKey: dto.username,
  } as const;
  await Query.create(Session, newSession);
  return newSession;
}
