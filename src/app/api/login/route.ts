import { initSession } from "@/entities/session/services/init-session";
import { findUserDto } from "@/entities/user/dtos/find-user.dto";
import { findUser } from "@/entities/user/services/find-user";
import { UnauthorizedException } from "@/server/shared/exceptions/unauthorized.exception";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, findUserDto);

  const foundUser = await findUser(dto);
  if (!foundUser) {
    throw new UnauthorizedException("Invalid password");
  }
  const newSession = await initSession(foundUser);

  return NextResponse.json({ message: "Logged in!", data: newSession });
});
