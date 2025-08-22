import z from "zod";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import { findSessionDto } from "@/entities/session/dtos/find-session.dto";
import { string } from "@/server/shared/schema/string";

export const questionDto = z.object({
  question: string.max(MAX_LONG_VARCHAR),
});

export const aiQuestionDto = questionDto.extend(findSessionDto.shape);

export type QuestionDto = z.infer<typeof questionDto>;
export type AiQuestionDto = z.infer<typeof aiQuestionDto>;
