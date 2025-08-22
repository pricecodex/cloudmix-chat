import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import { string } from "@/server/shared/schema/string";
import z from "zod";

export const sessionUsernameDto = string.max(MAX_SHORT_VARCHAR);

export const findSessionDto = z.object({
  username: sessionUsernameDto,
  token: string.max(MAX_SHORT_VARCHAR),
});
