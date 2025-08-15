import { requestHandler } from "@/server/shared/request/handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const body = await req.json();
  return NextResponse.json({});
});
