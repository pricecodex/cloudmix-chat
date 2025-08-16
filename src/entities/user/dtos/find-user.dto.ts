import { MAX_SHORT_VARCHAR } from "@/server/shared/db/constants";
import z from "zod";

export const findUserDto = z.object({
  username: z.string().max(MAX_SHORT_VARCHAR).nonempty(),
  password: z.string().max(MAX_SHORT_VARCHAR).nonempty(),
});

export type FindUserDto = z.infer<typeof findUserDto>;
