import { Session } from "@/entities/session/session.entity";
import { EntitySchema } from "../db/query";
import { ws } from "./ws";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function sendToActive(session: EntitySchema<typeof Session> | null, buffer: Buffer) {
  if (!session || !session.connectionId) {
    return;
  }
  await ws.send(
    new PostToConnectionCommand({
      ConnectionId: session.connectionId,
      Data: buffer,
    }),
  );
}
