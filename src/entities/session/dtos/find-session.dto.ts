import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const sessionUsernameDto = z.string().nonempty().max(MAX_SHORT_VARCHAR);

export const findSessionDto = z.object({
  username: sessionUsernameDto,
  token: z.string().nonempty().max(MAX_SHORT_VARCHAR),
});
