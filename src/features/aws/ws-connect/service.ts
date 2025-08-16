import { authorizeSession } from "@/entities/session/services/authorize-session";
import { Session } from "@/entities/session/session.entity";
import { Query } from "@/server/shared/db/query";

export async function handleWsConnection(session: { username: string; token: string; connectionId: string }) {
  await authorizeSession(session);
  await Query.update(Session, session.username, {
    connectionId: session.connectionId,
  });
  // todoy notify about is only
}
