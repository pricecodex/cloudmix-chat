import { Session } from "@/entities/session/session.entity";
import { Query } from "@/server/shared/db/query";

export async function handleWsConnection(session: { username: string; token: string; connectionId: string }) {
  await Query.update(Session, { primaryKey: session.username }, { connectionId: session.connectionId });
}
