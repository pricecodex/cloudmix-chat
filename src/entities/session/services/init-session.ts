import { Query } from "@/server/shared/db/query";
import { InitSessionDto } from "../dtos/init-session.dto";
import { Session } from "../session.entity";
import { randomBytes } from "crypto";
import { MAX_SHORT_VARCHAR } from "@/server/shared/db/constants";
import { findSession } from "./find-sesssion";

export async function initSession(dto: InitSessionDto) {
  const prevSession = await findSession(dto.username);

  if (prevSession) {
    await Query.remove(Session, prevSession.username);
  }
  const token = randomBytes(Math.ceil(MAX_SHORT_VARCHAR / 2)).toString("hex");
  const newSession = {
    token,
    status: "active",
    username: dto.username,
  } as const;

  await Query.create(Session, newSession);
  return newSession;
}
