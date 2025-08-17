import z from "zod";
import { sessionUsernameDto } from "./find-session.dto";

export const initSessionDto = z.object({
  username: sessionUsernameDto,
});

export type InitSessionDto = z.infer<typeof initSessionDto>;
