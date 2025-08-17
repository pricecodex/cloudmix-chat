import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import z from "zod";

export const searchUsersDto = z.object({
  token: z.string().nonempty().max(MAX_SHORT_VARCHAR),
  username: z.string().nonempty().max(MAX_SHORT_VARCHAR),
  search: z.string().nonempty().max(MAX_SHORT_VARCHAR),
});

export type SearchUsersDto = z.infer<typeof searchUsersDto>;
