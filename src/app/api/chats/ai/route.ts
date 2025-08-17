import { findSessionDto } from "@/entities/session/dtos/find-session.dto";
import { askAiQuestion } from "@/features/ai";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, findSessionDto.extend({ question: z.string() }));

  const answer = await askAiQuestion(dto);
  return NextResponse.json({ data: { answer } });
});
