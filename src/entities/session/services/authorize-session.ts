import { UnauthorizedException } from "@/server/shared/exceptions/unauthorized.exception";
import { findSession } from "./find-sesssion";

export async function authorizeSession(dto: { username: string; token: string }) {
  const session = await findSession(dto.username);
  if (!session || session.token !== dto.token) {
    throw new UnauthorizedException("You can't make this request");
  }
  return session;
}
