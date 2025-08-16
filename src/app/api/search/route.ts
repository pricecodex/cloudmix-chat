import { searchUsers } from "@/entities/user/services/search-users";
import { requestHandler } from "@/server/shared/request/handler";
import { NextRequest, NextResponse } from "next/server";

export const GET = requestHandler(async (req: NextRequest) => {
  const prefix = req.nextUrl.searchParams.get("search");
  if (!prefix) {
    return NextResponse.json({ data: [] });
  }
  const users = await searchUsers(prefix);
  return NextResponse.json({ data: users });
});
