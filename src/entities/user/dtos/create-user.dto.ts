import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import { string } from "@/server/shared/schema/string";
import z from "zod";

export const createUserDto = z.object({
  username: string.max(MAX_SHORT_VARCHAR).nonempty(),
  password: string.max(MAX_SHORT_VARCHAR).nonempty(),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
