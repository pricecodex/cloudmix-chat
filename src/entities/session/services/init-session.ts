import { Query } from "@/server/shared/db/query";
import { InitSessionDto } from "../dtos/init-session.dto";
import { Session } from "../session.entity";
import { findSession } from "./find-sesssion";
import { generateRandomString } from "@/server/shared/db/generate-randon-string";

export async function initSession(dto: InitSessionDto) {
  const prevSession = await findSession(dto.username);

  if (prevSession) {
    await Query.remove(Session, prevSession.username);
  }
  const token = generateRandomString();
  const newSession = {
    token,
    username: dto.username,
    connectionId: null,
  };

  await Query.create(Session, newSession);
  return newSession;
}
