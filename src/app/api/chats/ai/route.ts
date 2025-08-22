import { aiQuestionDto, askAiQuestion } from "@/features/ai";
import { requestHandler } from "@/server/shared/request/handler";
import { validateRequest } from "@/server/shared/request/validate";
import { NextRequest, NextResponse } from "next/server";

export const POST = requestHandler(async (req: NextRequest) => {
  const dto = await validateRequest(req, aiQuestionDto);

  const answer = await askAiQuestion(dto);
  return NextResponse.json({ data: { answer } });
});
