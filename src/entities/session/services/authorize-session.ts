import { UnauthorizedException } from "@/server/shared/exceptions/unauthorized.exception";
import { findSession } from "./find-sesssion";
import { AuthorizeSessionDto } from "../dtos/authorize-session.dto";

export async function authorizeSession(dto: AuthorizeSessionDto) {
  const session = await findSession(dto.username);
  if (!session || session.token !== dto.token) {
    throw new UnauthorizedException("You can't make this request");
  }
  return session;
}
