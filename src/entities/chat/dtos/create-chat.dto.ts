import { findSessionDto, sessionUsernameDto } from "@/entities/session/dtos/find-session.dto";
import { MAX_LONG_VARCHAR } from "@/server/shared/constants";
import { string } from "@/server/shared/schema/string";

export const createChatDto = findSessionDto.extend({
  to: sessionUsernameDto,
  message: string.max(MAX_LONG_VARCHAR),
});
