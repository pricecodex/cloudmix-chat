import { authorizeSession } from "@/entities/session/services/authorize-session";
import { searchUsersDto } from "@/entities/user/dtos/search-users.dto";
import { searchUsers } from "@/entities/user/services/search-users";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, searchUsersDto);
  await authorizeSession(dto);
  const users = await searchUsers(dto.search);
  return NextResponse.json({ data: users });
});
