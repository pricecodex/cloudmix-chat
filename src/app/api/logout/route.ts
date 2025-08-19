import { findSessionDto } from "@/entities/session/dtos/find-session.dto";
import { authorizeSession } from "@/entities/session/services/authorize-session";
import { Session } from "@/entities/session/session.entity";
import { Query } from "@/server/shared/db/query";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, findSessionDto);
  await authorizeSession(dto);
  await Query.remove(Session, dto.username);

  return NextResponse.json({ message: "Logged out!" });
});
