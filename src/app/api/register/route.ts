import { createUserDto } from "@/entities/user/dtos/create-user.dto";
import { createUser } from "@/entities/user/services/create-user";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, createUserDto);

  await createUser(dto);

  return NextResponse.json({ message: "Created succesfully" });
});
