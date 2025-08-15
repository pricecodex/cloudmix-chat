import { MAX_SHORT_VARCHAR } from "@/server/shared/db/constants";
import z from "zod";

export const createUserDto = z.object({
  username: z.string().max(MAX_SHORT_VARCHAR).nonempty(),
  password: z.string().max(MAX_SHORT_VARCHAR).nonempty(),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
