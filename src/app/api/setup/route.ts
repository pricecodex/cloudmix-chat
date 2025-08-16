import { createTables } from "@/server/shared/db/db";
import { requestHandler } from "@/server/shared/request/handler";
import { NextResponse } from "next/server";

export const GET = requestHandler(async () => {
  await createTables();
  return NextResponse.json({ message: "Setup successfully" });
});
