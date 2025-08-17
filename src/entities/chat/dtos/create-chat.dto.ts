import { findSessionDto, sessionUsernameDto } from "@/entities/session/dtos/find-session.dto";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const createChatDto = findSessionDto.extend({
  to: sessionUsernameDto,
  message: z.string().nonempty().max(MAX_LONG_VARCHAR),
});
